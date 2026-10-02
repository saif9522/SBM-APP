/**
 * Global auth state.
 *  - cold-start bootstrap from SecureStore
 *  - password login, OTP login, register + OTP verification
 *  - token persistence + automatic 401 -> logout (via axios interceptor)
 */
import React, {
  createContext, useContext, useEffect, useMemo, useState, useCallback,
} from 'react';
import * as authStorage from '../utils/authStorage';
import { setUnauthorizedHandler } from '../api/axios';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          authStorage.getToken(),
          authStorage.getStoredUser(),
        ]);
        setTokenState(t);
        setUser(u);

        // Best-effort refresh of the user profile in the background.
        if (t) {
          authApi.me().then((fresh) => {
            setUser(fresh);
            authStorage.setStoredUser(fresh);
          }).catch(() => {});
        }
      } catch (e) {
        console.warn('Auth bootstrap failed:', e);
      } finally {
        // App ko kisi bhi haal me aage badhana zaroori hai
        setBootstrapping(false);
      }
    })();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setTokenState(null);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const persistSession = useCallback(async ({ token: t, user: u }) => {
    if (t) await authStorage.setToken(t);
    if (u) await authStorage.setStoredUser(u);
    setTokenState(t || null);
    setUser(u || null);
  }, []);

  // phone/code + password -> immediate session
  const loginWithPassword = useCallback(async ({ phone, password, role, code }) => {
    const res = await authApi.login({ phone, password, role, code });
    await persistSession(res);
    return res;
  }, [persistSession]);

  // registration -> OTP sent (no session yet)
  const register = useCallback((payload) => authApi.register(payload), []);

  // phone + otp -> session (registration verification; login has no OTP).
  const verifyOtp = useCallback(async ({ phone, otp }) => {
    const res = await authApi.verifyRegisterOtp({ phone, otp });
    await persistSession(res);
    return res;
  }, [persistSession]);

  // Resend the registration OTP.
  const resendOtp = useCallback(({ phone }) => authApi.resendRegisterOtp({ phone }), []);

  const logout = useCallback(async () => {
    await authStorage.clearAuth();
    setTokenState(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (patch) => {
    const next = { ...(user || {}), ...patch };
    setUser(next);
    await authStorage.setStoredUser(next);
  }, [user]);

  // Re-fetch the latest profile from the server (e.g. after paying a fee).
  const refreshUser = useCallback(async () => {
    try {
      const fresh = await authApi.me();
      setUser(fresh);
      await authStorage.setStoredUser(fresh);
      return fresh;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token,
    bootstrapping,
    loginWithPassword,
    register,
    verifyOtp,
    resendOtp,
    logout,
    updateUser,
    refreshUser,
    persistSession,
  }), [user, token, bootstrapping, loginWithPassword, register, verifyOtp, resendOtp, logout, updateUser, refreshUser, persistSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;