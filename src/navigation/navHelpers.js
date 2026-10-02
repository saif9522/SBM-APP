/**
 * Cross-tab navigation that gets BACK right.
 *
 * THE BUG
 * -------
 * Home (or Profile) did `navigation.navigate('Services', { screen: 'BloodHome' })`.
 * What happened next depended on whether the Services tab had been opened
 * before:
 *
 *   * never opened → Services stack = [BloodHome]
 *       back → the tab navigator's default ('firstRoute') → always Home,
 *       even if you came from Profile.
 *   * opened before → BloodHome was PUSHED on the old stack
 *       [ServicesHome, Gallery, …, BloodHome]
 *       back → some random old screen you'd left there earlier.
 *
 * And afterwards tapping the Services tab showed BloodHome/Gallery instead
 * of the services list.
 *
 * THE FIX
 * -------
 * 1. `openInTab()` always leaves the target stack as exactly [screen], so
 *    back can't land on a stale leftover.
 * 2. MainTabs uses backBehavior="history", so when that stack can't go back
 *    any further, back returns to the tab you actually came from
 *    (Home → Home, Profile → Profile).
 * 3. `resetStackOnTabPress()` — tapping a tab whose stack was deep-linked
 *    (bottom of the stack isn't the tab's own home) resets it to that home.
 */
import { CommonActions, StackActions } from '@react-navigation/native';

/** Find the nested stack state for a tab, walking up to the tab navigator. */
function findTabRoute(navigation, tabName) {
  let nav = navigation;
  for (let i = 0; i < 4 && nav; i += 1) {
    const state = nav.getState?.();
    const hit = state?.routes?.find((r) => r.name === tabName);
    if (hit) return { tabNav: nav, tabRoute: hit };
    nav = nav.getParent?.();
  }
  return { tabNav: navigation, tabRoute: null };
}

/**
 * Open `screen` inside the `tabName` stack as a fresh single-screen stack.
 *
 *   openInTab(navigation, 'Services', 'BloodHome')
 *   openInTab(navigation, 'Services', 'ServiceDetails', { service })
 */
export function openInTab(navigation, tabName, screen, params) {
  const { tabNav, tabRoute } = findTabRoute(navigation, tabName);
  const stackKey = tabRoute?.state?.key;

  if (stackKey && screen) {
    // Stack already mounted: replace its contents with just [screen] …
    tabNav.dispatch({
      ...CommonActions.reset({ index: 0, routes: [{ name: screen, params }] }),
      target: stackKey,
    });
    // … then switch to the tab (no `screen` param → nothing gets pushed).
    tabNav.navigate(tabName);
    return;
  }
  // Not mounted yet: React Navigation builds the stack as [screen] itself.
  tabNav.navigate(tabName, screen ? { screen, params } : undefined);
}

/**
 * `listeners` factory for a tab that hosts a stack.
 *
 *   <Tab.Screen name="Services" listeners={resetStackOnTabPress('ServicesHome')} … />
 */
export function resetStackOnTabPress(rootName) {
  return ({ navigation, route }) => ({
    tabPress: (e) => {
      const stack = route.state;
      if (!stack?.key || !stack.routes?.length) return;

      // A root opened from Home (search / View all) carries one-off params
      // (focusSearch, showBack) — a normal tab tap should get a clean root.
      const bottom = stack.routes[0];
      const bottomIsRoot = bottom?.name === rootName && !bottom?.params?.showBack;
      if (!bottomIsRoot) {
        // Deep-linked stack (e.g. [Gallery] opened from Profile) — show the
        // tab's own home instead of the leftover screen.
        e.preventDefault();
        navigation.dispatch({
          ...CommonActions.reset({ index: 0, routes: [{ name: rootName }] }),
          target: stack.key,
        });
        navigation.navigate(route.name);
        return;
      }
      if (navigation.isFocused() && stack.index > 0) {
        // Already on this tab → tapping it again goes to its home.
        e.preventDefault();
        navigation.dispatch({ ...StackActions.popToTop(), target: stack.key });
      }
    },
  });
}

/**
 * Header back that never dead-ends: go back if anything can; otherwise go
 * Home rather than silently doing nothing (which is what a bare goBack()
 * does in a release build when there is nowhere to go).
 */
export function smartBack(navigation) {
  if (!navigation) return;
  if (navigation.canGoBack?.()) {
    navigation.goBack();
    return;
  }
  navigation.navigate?.('Main', { screen: 'Home' });
}

export default { openInTab, resetStackOnTabPress, smartBack };
