import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';

import SplashScreen from '../screens/splash/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

// Logo (splash) screen ko kam se kam itni der dikhana hai (10 second),
// taaki wo flash hoke gayab na ho. Bootstrap agar isse jaldi ho jaaye tab
// bhi logo pura 10 sec dikhega.
const MIN_SPLASH_MS = 10000;

export default function RootNavigator() {
  const { bootstrapping, isAuthenticated } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  // Minimum splash timer — bootstrap se independent.
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  // Pehla screen: LOGO wala splash. Jab tak auth bootstrap ya minimum
  // splash time complete nahi hota, splash hi dikhega. Onboarding
  // ("Help Your Community") ab flow me nahi hai.
  if (bootstrapping || !splashDone) {
    return <SplashScreen />;
  }

  // Splash ke baad: agar logged-in hai to app, warna FORM (Login/Register).
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
