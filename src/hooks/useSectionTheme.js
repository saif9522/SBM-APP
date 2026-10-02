/**
 * Current screen ka section theme.
 *
 * `useRoute()` navigator ke bahar (jaise Modal ke andar) crash karta hai,
 * isliye seedha NavigationRouteContext padhte hain — wo bahar `undefined`
 * deta hai aur hum default theme par gir jaate hain. Isliye ye hook kisi
 * bhi component me bina dar ke use ho sakta hai.
 */
import { useContext } from 'react';
import { NavigationRouteContext } from '@react-navigation/native';
import { themeForRoute, themeFor, DEFAULT_THEME } from '../constants/sectionThemes';

export default function useSectionTheme(override) {
  const route = useContext(NavigationRouteContext);
  if (override) return typeof override === 'string' ? themeFor(override) : override;
  return route?.name ? themeForRoute(route.name) : DEFAULT_THEME;
}
