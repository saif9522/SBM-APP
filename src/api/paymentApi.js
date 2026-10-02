/**
 * Payments — ask the SERVER whether something is paid.
 *
 * Works with BOTH backends:
 *  - New backend: /api/payments/status/ checks with Razorpay and records a
 *    payment the checkout callback missed.
 *  - Old backend (not yet redeployed): that endpoint doesn't exist. We
 *    detect that once (Django's HTML 404 page, not a DRF JSON 404), stop
 *    calling it, and the screens simply re-read their own record instead
 *    (user.payment_status, application.payment_status, donation.status).
 *    Nothing hangs on a "Confirming…" spinner and nothing is mis-reported.
 */
import api from './axios';

let statusEndpointMissing = false;
let feesEndpointMissing = false;

/** A 404 from an unknown URL (HTML page) vs a DRF "not yours/not found" (JSON). */
function isMissingEndpoint(err) {
  const r = err?.response;
  if (!r || r.status !== 404) return false;
  const type = String(r.headers?.['content-type'] || '');
  return !type.includes('application/json');
}

export function statusCheckSupported() {
  return !statusEndpointMissing;
}

/**
 * @returns {Promise<{paid:boolean, status?:string, unsupported?:boolean}>}
 * Never throws for "endpoint missing"; throws only for real network errors.
 */
export async function paymentStatus(kind, ref) {
  if (statusEndpointMissing) return { paid: false, unsupported: true };
  try {
    const { data } = await api.get('payments/status/', { params: { kind, ref } });
    return data;
  } catch (err) {
    if (isMissingEndpoint(err)) {
      statusEndpointMissing = true;
      return { paid: false, unsupported: true };
    }
    throw err;
  }
}

/**
 * Fee amounts. On the old backend the amounts aren't exposed, so we return
 * `unknown: true` — screens then still ask for payment but don't print a
 * number that might be wrong; the Razorpay page always shows the real amount.
 */
let feesCache = null;
export async function fees() {
  if (feesCache) return feesCache;
  if (feesEndpointMissing) return { registration: null, career: null, unknown: true };
  try {
    const { data } = await api.get('payments/fees/');
    feesCache = data;
    return data;
  } catch (err) {
    if (isMissingEndpoint(err)) feesEndpointMissing = true;
    return { registration: null, career: null, unknown: true };
  }
}

/**
 * Poll a few times — Razorpay can take a few seconds to mark a UPI payment
 * captured after the user comes back from GPay/PhonePe. Stops immediately
 * on the old backend.
 */
export async function waitForPaid(kind, ref, { tries = 4, delayMs = 2500 } = {}) {
  for (let i = 0; i < tries; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const s = await paymentStatus(kind, ref);
      if (s?.paid || s?.unsupported) return s;
    } catch { /* network blip — try again */ }
    // eslint-disable-next-line no-await-in-loop
    if (i < tries - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  return { paid: false };
}

/** Human label for a fee: "₹159", or '' when the amount isn't known. */
export function feeText(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? `₹${n.toLocaleString('en-IN')}` : '';
}

/** Does this fee need collecting? Unknown (old backend) → yes; 0 → no. */
export function feeRequired(value) {
  if (value === null || value === undefined || value === '') return true;
  return Number(value) > 0;
}

export default { paymentStatus, fees, waitForPaid, feeText, feeRequired, statusCheckSupported };
