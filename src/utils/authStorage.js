/**
 * THE single place that reads/writes the auth credential.
 *
 * Every other file (axios interceptor, AuthContext) goes through here, so
 * when the auth mechanism is finalised (see authApi.js) we change ONE file.
 *
 * Tokens are stored with expo-secure-store (encrypted keystore/keychain),
 * never in plain AsyncStorage — per the security requirements.
 */
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'sbm_auth_token';
const USER_KEY = 'sbm_auth_user';

export async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token) {
  if (!token) return removeToken();
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, String(token));
  } catch {}
}

export async function removeToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {}
}

// Cache the lightweight user object so the app can render instantly on
// cold start before the network call returns. Not sensitive -> fine here.
export async function getStoredUser() {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setStoredUser(user) {
  try {
    if (user) await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    else await SecureStore.deleteItemAsync(USER_KEY);
  } catch {}
}

export async function clearAuth() {
  await Promise.all([removeToken(), setStoredUser(null)]);
}

export default { getToken, setToken, removeToken, getStoredUser, setStoredUser, clearAuth };
