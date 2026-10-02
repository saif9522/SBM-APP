import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../constants/theme';
import { themeFor } from '../constants/sectionThemes';
import { resetStackOnTabPress } from './navHelpers';

import HomeScreen from '../screens/home/HomeScreen';
import ServicesStack from './ServicesStack';
import ProfileStack from './ProfileStack';
import BookingsStack from './BookingsStack';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

const Tab = createBottomTabNavigator();

const ICONS = { Home: 'home', Services: 'grid', Bookings: 'briefcase', Notifications: 'notifications', Profile: 'person' };

// Har tab ka active rang uske section theme se.
const TAB_SECTION = { Home: 'home', Services: 'services', Bookings: 'bookings', Notifications: 'notifications', Profile: 'profile' };

// Base bar (bottom inset ke bina). Actual style neeche insets ke saath banti hai.
const BASE_BAR = {
  borderTopColor: colors.border,
  borderTopWidth: 1,
  backgroundColor: colors.surface,
  paddingTop: 6,
};

/**
 * Tab bar ki height + bottom padding, device ke safe-area (gesture / home
 * indicator) ke hisaab se. Isse footer ke icons phone ki navigation bar ke
 * "andar" nahi jaate — proper unke upar dikhte hain.
 */
function makeTabBarStyle(insets) {
  const bottomInset = insets.bottom || 0;
  return {
    ...BASE_BAR,
    height: 60 + bottomInset,
    paddingBottom: (bottomInset > 0 ? bottomInset : 8) + (Platform.OS === 'android' ? 4 : 0),
  };
}

// Nested detail screens par tab bar chhupao; stack ke root par hi dikhao.
function tabBarStyleFor(route, rootName, insets) {
  const name = getFocusedRouteNameFromRoute(route) ?? rootName;
  return name === rootName ? makeTabBarStyle(insets) : { display: 'none' };
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const barStyle = makeTabBarStyle(insets);

  return (
    <Tab.Navigator
      // 'history': jab kisi stack me aur peeche jaane ki jagah na ho, to back
      // usi tab par le jaata hai jahan se aaye the (Profile → Gallery → back
      // → Profile). Default 'firstRoute' hamesha Home par patak deta tha.
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: themeFor(TAB_SECTION[route.name]).tint,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: barStyle,
        tabBarLabelStyle: { fontSize: typography.tiny, fontWeight: typography.medium, marginBottom: 2 },
        tabBarIcon: ({ color, size, focused }) => {
          const base = ICONS[route.name] || 'ellipse';
          return <Ionicons name={focused ? base : `${base}-outline`} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Services"
        listeners={resetStackOnTabPress('ServicesHome')}
        component={ServicesStack}
        options={({ route }) => ({ tabBarStyle: tabBarStyleFor(route, 'ServicesHome', insets) })}
      />
      <Tab.Screen
        name="Bookings"
        listeners={resetStackOnTabPress('BookingsHome')}
        component={BookingsStack}
        options={({ route }) => ({ tabBarStyle: tabBarStyleFor(route, 'BookingsHome', insets) })}
      />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen
        name="Profile"
        listeners={resetStackOnTabPress('ProfileHome')}
        component={ProfileStack}
        options={({ route }) => ({ tabBarStyle: tabBarStyleFor(route, 'ProfileHome', insets) })}
      />
    </Tab.Navigator>
  );
}
