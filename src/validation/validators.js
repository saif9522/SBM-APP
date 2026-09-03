/**
 * Small, dependency-free validators. Each returns an error string or ''.
 * Screens collect these into an { field: message } object.
 */

export const isBlank = (v) => !v || !String(v).trim();

export function required(value, label = 'This field') {
  return isBlank(value) ? `${label} is required.` : '';
}

// Indian mobile: 10 digits, starting 6-9 (backend stores up to 12 chars).
export function phone(value) {
  const v = String(value || '').replace(/\s+/g, '');
  if (!v) return 'Phone number is required.';
  if (!/^[6-9]\d{9}$/.test(v)) return 'Enter a valid 10-digit mobile number.';
  return '';
}

export function email(value, { requiredField = false } = {}) {
  if (isBlank(value)) return requiredField ? 'Email is required.' : '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
    ? ''
    : 'Enter a valid email address.';
}

export function password(value) {
  if (isBlank(value)) return 'Password is required.';
  if (String(value).length < 6) return 'Password must be at least 6 characters.';
  return '';
}

export function confirmPassword(value, original) {
  if (isBlank(value)) return 'Please confirm your password.';
  if (value !== original) return 'Passwords do not match.';
  return '';
}

export function otp(value, length = 6) {
  const v = String(value || '').trim();
  if (!v) return 'Enter the OTP sent to your phone.';
  if (!new RegExp(`^\\d{${length}}$`).test(v)) return `Enter the ${length}-digit OTP.`;
  return '';
}

// Runs a map of { field: () => errorString } and returns { errors, isValid }.
export function validate(rules) {
  const errors = {};
  for (const key of Object.keys(rules)) {
    const msg = rules[key]();
    if (msg) errors[key] = msg;
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
}

export default { required, phone, email, password, confirmPassword, otp, validate, isBlank };

// Optional date in YYYY-MM-DD. Empty is allowed unless requiredField.
export function dateISO(value, { requiredField = false } = {}) {
  if (isBlank(value)) return requiredField ? 'Date is required.' : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value).trim())) return 'Use format YYYY-MM-DD.';
  const d = new Date(value);
  return isNaN(d) ? 'Enter a valid date.' : '';
}
