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

  // phone + password -> immediate session
  const loginWithPassword = useCallback(async ({ phone, password }) => {
    const res = await authApi.login({ phone, password });
    await persistSession(res);
    return res;
  }, [persistSession]);

  // phone -> OTP sent (no session yet)
  const requestLoginOtp = useCallback((phone) => authApi.requestLoginOtp({ phone }), []);

  // registration -> OTP sent (no session yet)
  const register = useCallback((payload) => authApi.register(payload), []);

  // phone + otp -> session. Registration and OTP-login use DIFFERENT backend
  // endpoints, so branch on the flow the screen was opened with.
  const verifyOtp = useCallback(async ({ phone, otp, flow }) => {
    const res = flow === 'register'
      ? await authApi.verifyRegisterOtp({ phone, otp })
      : await authApi.verifyLoginOtp({ phone, otp });
    await persistSession(res);
    return res;
  }, [persistSession]);

  // Resend the code for whichever flow we're in.
  const resendOtp = useCallback(({ phone, flow }) => (
    flow === 'register'
      ? authApi.resendRegisterOtp({ phone })
      : authApi.requestLoginOtp({ phone })
  ), []);

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

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token,
    bootstrapping,
    loginWithPassword,
    requestLoginOtp,
    register,
    verifyOtp,
    resendOtp,
    logout,
    updateUser,
    persistSession,
  }), [user, token, bootstrapping, loginWithPassword, requestLoginOtp, register, verifyOtp, resendOtp, logout, updateUser, persistSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;