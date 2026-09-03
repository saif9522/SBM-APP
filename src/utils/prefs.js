/** Small non-sensitive local preferences (AsyncStorage). */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = { notifications: 'sbm_pref_notifications', language: 'sbm_pref_language' };

export async function getPref(key, fallback = null) {
  try {
    const v = await AsyncStorage.getItem(KEYS[key] || key);
    if (v === null) return fallback;
    try { return JSON.parse(v); } catch { return v; }
  } catch { return fallback; }
}

export async function setPref(key, value) {
  try { await AsyncStorage.setItem(KEYS[key] || key, JSON.stringify(value)); } catch {}
}

export default { getPref, setPref };
