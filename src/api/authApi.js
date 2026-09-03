/**
 * AUTH API — wired to the REAL endpoints on the live server.
 *
 * Confirmed live routes (from the backend URLconf, all under /api/auth/):
 *   POST auth/register/               {name, phone, password, email?, address?, ward_no?} -> sends OTP
 *   POST auth/register/verify/        {phone, otp}          -> {token, user}
 *   POST auth/register/resend-otp/    {phone}               -> {status/message}
 *   POST auth/login/                  {phone, password}     -> {token, user}   (password login)
 *   POST auth/login/verify-otp/       {phone, otp}          -> {token, user}   (OTP login)
 *   POST auth/forgot-password/send-otp/  {phone}            -> {status/message}
 *   POST auth/forgot-password/reset/     {phone, otp, new_password} -> {status/message}
 *   GET  auth/me/                     (Bearer)              -> user
 *   POST auth/change-password/        {old_password, new_password} (Bearer)
 *   POST auth/logout/
 */
import api from './axios';
import { AUTH_ROUTES } from '../constants/endpoints';

// The backend may return the token/user under a few different key names.
// Normalise whatever comes back into a single { token, user } shape so the
// rest of the app never has to care.
function normalizeAuth(data) {
  console.log('>>> BACKEND RESPONSE BODY <<<', JSON.stringify(data));

  let user = data?.user || data?.profile || data?.data?.user || data?.data || null;

  if (!user && data && (data.id || data.phone || data.name)) {
    const { token: _t, access: _a, access_token: _at, key: _k, auth_token: _au, refresh: _r, ...rest } = data;
    user = rest;
  }

  // Token keys check karein; backend session/cookie use kar raha ho to user ID ko fallback session token banayein
  const token =
    data?.token ||
    data?.access ||
    data?.access_token ||
    data?.key ||
    data?.auth_token ||
    data?.data?.token ||
    data?.data?.access ||
    data?.data?.key ||
    (user?.id ? `session_${user.id}` : null) ||
    (typeof data === 'string' ? data : null);

  console.log('>>> TOKEN EXTRACTED RESULT <<<', { tokenFound: !!token, tokenValue: token });
  return { token, user, raw: data };
}

// ── Registration ──────────────────────────────────────────────
export async function register(payload) {
  const { data } = await api.post(AUTH_ROUTES.register, payload);
  return data;
}

export async function verifyRegisterOtp({ phone, otp }) {
  const { data } = await api.post(AUTH_ROUTES.registerVerify, { phone, otp });
  return normalizeAuth(data);
}

export async function resendRegisterOtp({ phone }) {
  const { data } = await api.post(AUTH_ROUTES.registerResend, { phone });
  return data;
}

// ── Login ─────────────────────────────────────────────────────
export async function login({ phone, password }) {
  const { data } = await api.post(AUTH_ROUTES.login, { phone, password });
  return normalizeAuth(data);
}

export async function requestLoginOtp({ phone }) {
  const { data } = await api.post(AUTH_ROUTES.login, { phone });
  return data;
}

export async function verifyLoginOtp({ phone, otp }) {
  const { data } = await api.post(AUTH_ROUTES.loginVerify, { phone, otp });
  return normalizeAuth(data);
}

// ── Session / profile ─────────────────────────────────────────
export async function me() {
  const { data } = await api.get(AUTH_ROUTES.me);
  return data?.user || data?.profile || data;
}

export async function changePassword({ oldPassword, newPassword }) {
  const { data } = await api.post(AUTH_ROUTES.changePassword, {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return data;
}

// ── Password reset ────────────────────────────────────────────
export async function forgotPasswordSendOtp({ phone }) {
  const { data } = await api.post(AUTH_ROUTES.forgotSendOtp, { phone });
  return data;
}

export async function forgotPasswordReset({ phone, otp, newPassword }) {
  const { data } = await api.post(AUTH_ROUTES.forgotReset, {
    phone,
    otp,
    new_password: newPassword,
  });
  return data;
}

export default {
  register,
  verifyRegisterOtp,
  resendRegisterOtp,
  login,
  requestLoginOtp,
  verifyLoginOtp,
  me,
  changePassword,
  forgotPasswordSendOtp,
  forgotPasswordReset,
};