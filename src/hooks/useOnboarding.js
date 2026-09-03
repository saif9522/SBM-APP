import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sbm_onboarding_done';

/** Onboarding completion is a non-sensitive flag -> AsyncStorage is fine. */
export default function useOnboarding() {
  const [done, setDone] = useState(null); // null while loading

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => setDone(v === '1'));
  }, []);

  const complete = useCallback(async () => {
    await AsyncStorage.setItem(KEY, '1');
    setDone(true);
  }, []);

  return { done, complete };
}
