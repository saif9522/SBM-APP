import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import useSectionTheme from '../hooks/useSectionTheme';

const { width: W, height: H } = Dimensions.get('window');

/**
 * Consistent screen container. Background ab section ke rang ka halka
 * gradient hai (Blood → halka gulabi-laal, Pass → halka neela …), taaki
 * content readable rahe par section pehchana jaaye.
 */
export default function Screen({ children, style, edges = ['bottom'], theme: themeOverride }) {
  const theme = useSectionTheme(themeOverride);
  const gradId = `screenBg-${theme.key}`;
  return (
    <View style={[styles.fill, { backgroundColor: theme.soft[0] }]}>
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.soft[0]} />
            <Stop offset="1" stopColor={theme.soft[1]} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradId})`} />
      </Svg>
      <SafeAreaView style={styles.safe} edges={edges}>
        <View style={[styles.body, style]}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  body: { flex: 1 },
});
