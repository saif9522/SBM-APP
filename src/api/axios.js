/**
 * Centralised Axios instance + interceptors.
 *
 * Request:  if an auth token exists (from SecureStore), attach it.
 * Response: on 401, clear the stored credential and notify listeners so the
 *           app can bounce the user to Login. We DON'T import navigation here
 *           (that would create a cycle) — instead AuthContext subscribes.
 */
import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../constants/config';
import { getToken, clearAuth } from '../utils/authStorage';

const api = axios.create({
  baseURL: `${API_BASE_URL}/`,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
  // The backend also accepts session cookies; enabling this lets a
  // cookie-based auth strategy work too without further changes.
  withCredentials: true,
});

// ── 401 subscription (AuthContext registers a handler) ──
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

// ── Request: attach token if present ──
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    // A JWT has three dot-separated segments -> "Bearer". A DRF/opaque token
    // does not -> "Token". This makes the client work with either backend
    // scheme without a code change.
    const scheme = String(token).split('.').length === 3 ? 'Bearer' : 'Token';
    config.headers.Authorization = `${scheme} ${token}`;
  }
  return config;
});

// ── Response: normalise 401 ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await clearAuth();
      if (typeof onUnauthorized === 'function') onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
