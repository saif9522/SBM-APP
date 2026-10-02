import React, { useContext, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContext, NavigationRouteContext } from '@react-navigation/native';
import { spacing, typography, radius, shadow } from '../constants/theme';
import useSectionTheme from '../hooks/useSectionTheme';
import { smartBack } from '../navigation/navHelpers';

// Tab ke home screens — inpar back button nahi hota.
const TAB_ROOTS = new Set(['Home', 'ServicesHome', 'BookingsHome', 'ProfileHome', 'Notifications']);

/**
 * Section-coloured screen header.
 *
 * Rang: current route se apne aap (constants/sectionThemes.js). Blood ke
 * screens laal, Pass neele, Gallery baingani… `theme="blood"` se override
 * bhi kar sakte hain.
 *
 * Back button:
 *   - tab ke home screen par nahi dikhta
 *   - baaki har screen par dikhta hai, chahe screen ne `onBack` diya ho ya nahi
 *   - dabane par: peeche ja sake to peeche, warna Home — kabhi dead-end nahi
 *   - `onBack={false}` se chhupa sakte hain
 */
export default function Header({ title, onBack, right = null, subtitle, theme: themeOverride }) {
  const insets = useSafeAreaInsets();
  const [h, setH] = useState(0);
  const SCREEN_W = Dimensions.get('window').width;
  const theme = useSectionTheme(themeOverride);
  const navigation = useContext(NavigationContext);
  const route = useContext(NavigationRouteContext);

  // Tab ka home screen normally bina back ke hota hai — par agar Home ke
  // search / "View all" se aaye hain (showBack param), to back dikhao.
  const isTabRoot = TAB_ROOTS.has(route?.name) && !route?.params?.showBack;
  const showBack = onBack === false
    ? false
    : typeof onBack === 'function' || (!!navigation && !isTabRoot);

  const handleBack = () => {
    // Screen ka apna onBack tabhi chalao jab sach me peeche ja sakte hain;
    // warna goBack() release build me chupchaap kuch nahi karta.
    if (typeof onBack === 'function' && navigation?.canGoBack?.()) {
      onBack();
      return;
    }
    smartBack(navigation);
  };

  const gradId = `hdr-${theme.key}`;

  return (
    <View style={[styles.shadow, { backgroundColor: theme.grad[1] }]}>
      <View
        style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}
        onLayout={(e) => setH(e.nativeEvent.layout.height)}
      >
        {h > 0 ? (
          <Svg width={SCREEN_W} height={h} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={theme.grad[0]} />
                <Stop offset="0.6" stopColor={theme.grad[1]} />
                <Stop offset="1" stopColor={theme.grad[2]} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradId})`} />
            <Circle cx={SCREEN_W - 20} cy={18} r={70} fill="#FFFFFF" opacity={0.07} />
            <Circle cx={24} cy={h - 6} r={46} fill="#FFFFFF" opacity={0.05} />
          </Svg>
        ) : null}

        <View style={styles.row}>
          {showBack ? (
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              style={styles.back}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
          ) : (
            <View style={styles.back} />
          )}
          <View style={styles.titleWrap}>
            <View style={styles.titleRow}>
              <Ionicons name={theme.icon} size={16} color="rgba(255,255,255,0.9)" style={{ marginRight: 6 }} />
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
            </View>
            {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
          <View style={styles.right}>{right}</View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg,
    ...shadow.card,
  },
  wrap: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  back: { width: 36, alignItems: 'flex-start', justifyContent: 'center' },
  right: { width: 36, alignItems: 'flex-end', justifyContent: 'center' },
  titleWrap: { flex: 1, alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', maxWidth: '100%' },
  title: { fontSize: typography.h3, fontWeight: typography.semibold, color: '#fff', flexShrink: 1 },
  subtitle: { fontSize: typography.tiny, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
});
