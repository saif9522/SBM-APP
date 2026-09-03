import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../constants/theme';

import HomeScreen from '../screens/home/HomeScreen';
import ServicesStack from './ServicesStack';
import ProfileStack from './ProfileStack';
import BookingsStack from './BookingsStack';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

const Tab = createBottomTabNavigator();

const ICONS = { Home: 'home', Services: 'grid', Bookings: 'briefcase', Notifications: 'notifications', Profile: 'person' };

const TAB_BAR = {
  height: 62, paddingBottom: 8, paddingTop: 6,
  borderTopColor: colors.border, backgroundColor: colors.surface,
};

// Show the tab bar only on a stack's root screen; hide it on nested details.
function tabBarStyleFor(route, rootName) {
  const name = getFocusedRouteNameFromRoute(route) ?? rootName;
  return name === rootName ? TAB_BAR : { display: 'none' };
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: TAB_BAR,
        tabBarLabelStyle: { fontSize: typography.tiny, fontWeight: typography.medium },
        tabBarIcon: ({ color, size, focused }) => {
          const base = ICONS[route.name] || 'ellipse';
          return <Ionicons name={focused ? base : `${base}-outline`} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Services"
        component={ServicesStack}
        options={({ route }) => ({ tabBarStyle: tabBarStyleFor(route, 'ServicesHome') })}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsStack}
        options={({ route }) => ({ tabBarStyle: tabBarStyleFor(route, 'BookingsHome') })}
      />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={({ route }) => ({ tabBarStyle: tabBarStyleFor(route, 'ProfileHome') })}
      />
    </Tab.Navigator>
  );
}
