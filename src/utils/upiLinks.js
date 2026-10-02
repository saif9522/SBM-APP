/**
 * Turn the links Razorpay's checkout emits into something Android can open.
 *
 * THE BUG
 * -------
 * On a phone, Razorpay's UPI buttons (GPay / PhonePe / Paytm / BHIM) are
 * Chrome "intent" links:
 *
 *   intent://pay?pa=merchant@upi&am=1.00&…#Intent;scheme=upi;package=com.phonepe.app;end
 *
 * Chrome understands that format — which is why paying on the WEBSITE
 * worked. React Native's Linking.openURL does not: it wraps the string in
 * `new Intent(ACTION_VIEW, Uri.parse("intent://…"))`, no installed app
 * handles the made-up "intent:" scheme, it throws ActivityNotFound — and
 * the old PaymentModal swallowed that error. So in the APP, tapping GPay
 * silently did nothing, the donation stayed "Pending" with no UPI ref.
 *
 * THE FIX
 * -------
 * Rebuild the real URL from the intent's `scheme=` part:
 *   intent://pay?pa=…#Intent;scheme=upi;…;end   →   upi://pay?pa=…
 * `upi://` is a normal deep link every UPI app registers, so Android opens
 * it (or shows the "Pay with…" chooser).
 */

const INTENT_RE = /^intent:\/\/([^#]*)#Intent;(.*);end;?$/i;

/**
 * Parse an Android intent URL.
 * @returns {{ url: string, pkg: string|null, fallback: string|null } | null}
 */
export function parseIntentUrl(raw) {
  const m = String(raw || '').match(INTENT_RE);
  if (!m) return null;
  const [, rest, extras] = m;
  const params = {};
  extras.split(';').forEach((kv) => {
    const i = kv.indexOf('=');
    if (i > 0) params[kv.slice(0, i)] = kv.slice(i + 1);
  });
  const scheme = params.scheme || 'upi';
  let fallback = params['S.browser_fallback_url'] || null;
  if (fallback) {
    try { fallback = decodeURIComponent(fallback); } catch { /* keep raw */ }
  }
  return { url: `${scheme}://${rest}`, pkg: params.package || null, fallback };
}

// Schemes that belong to payment apps — must be launched outside the WebView.
const APP_SCHEMES = /^(upi|tez|gpay|phonepe|paytmmp|paytm|bhim|credpay|mobikwik|amazonpay|freecharge|whatsapp|intent):/i;

export function isExternalPaymentLink(url) {
  return APP_SCHEMES.test(String(url || ''));
}

/**
 * What to actually pass to Linking.openURL for a checkout link.
 * @returns {{ url: string, fallback: string|null, pkg: string|null }}
 */
export function launchTargetFor(url) {
  const parsed = parseIntentUrl(url);
  if (parsed) return parsed;
  return { url: String(url || ''), fallback: null, pkg: null };
}

export default { parseIntentUrl, isExternalPaymentLink, launchTargetFor };
