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
// Citizen -> phone + password  (auth/login/)
// Agent    -> agent code / phone + password  (auth/agent/login/)
// Employee -> employee id / phone + password (auth/employee/login/)
export async function login({ phone, password, role, code }) {
  const id = (code || phone || '').trim();
  if (role === 'agent') {
    const { data } = await api.post(AUTH_ROUTES.agentLogin, {
      identifier: id, agent_code: id, code: id, phone: id, password,
    });
    return normalizeAuth(data);
  }
  if (role === 'employee') {
    const { data } = await api.post(AUTH_ROUTES.employeeLogin, {
      identifier: id, employee_id: id, code: id, phone: id, password,
    });
    return normalizeAuth(data);
  }
  const { data } = await api.post(AUTH_ROUTES.login, { phone: id, password });
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
  me,
  changePassword,
  forgotPasswordSendOtp,
  forgotPasswordReset,
};