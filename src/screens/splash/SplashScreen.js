import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { LOGO } from '../../constants/assets';
import { colors, spacing, typography, radius, shadow } from '../../constants/theme';

/**
 * Launch / logo screen — rich GREEN gradient background (app ki brand theme),
 * white logo card, wordmark, spinning ring aur ek progress bar. Professional
 * look jo baaki app ke green + white theme ke saath match karta hai.
 *
 * 10 second tak dikhta hai (RootNavigator ka MIN_SPLASH_MS).
 */
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const RING = 26;
const SPLASH_MS = 10000;

// White ke shades (green background par accha contrast) for the spinner ring.
const DOT_SHADES = [
  'rgba(255,255,255,1)', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.55)',
  'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.85)',
];

export default function SplashScreen() {
  const spin = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true })
    ).start();
    Animated.timing(progress, {
      toValue: 1, duration: SPLASH_MS, easing: Easing.inOut(Easing.ease), useNativeDriver: false,
    }).start();
  }, [spin, progress, pop]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.bg}>
      <StatusBar style="light" />

      {/* ── Green gradient + decorative circles background ── */}
      <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#1BA80C" />
            <Stop offset="0.55" stopColor="#138808" />
            <Stop offset="1" stopColor="#0B5E04" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
        {/* soft depth circles */}
        <Circle cx={SCREEN_W - 30} cy={90} r={130} fill="#FFFFFF" opacity={0.06} />
        <Circle cx={40} cy={SCREEN_H - 120} r={160} fill="#FFFFFF" opacity={0.05} />
        <Circle cx={SCREEN_W - 60} cy={SCREEN_H - 60} r={70} fill="#FFFFFF" opacity={0.05} />
      </Svg>

      <View style={styles.center}>
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: pop }] }]}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Text style={styles.appName}>Swachh Bharat Mission</Text>

        <View style={styles.wordmarkRow}>
          <View style={styles.rule} />
          <Text style={styles.wordmark}>Welcome to SBM</Text>
          <View style={styles.rule} />
        </View>

        {/* spinning ring */}
        <Animated.View style={[styles.ring, { transform: [{ rotate }] }]}>
          {DOT_SHADES.map((c, i) => {
            const angle = (i / DOT_SHADES.length) * 2 * Math.PI;
            const x = Math.cos(angle) * RING;
            const y = Math.sin(angle) * RING;
            return (
              <View
                key={i}
                style={[styles.dot, { backgroundColor: c, transform: [{ translateX: x }, { translateY: y }] }]}
              />
            );
          })}
        </Animated.View>

        {/* progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: barWidth }]} />
        </View>
        <Text style={styles.loading}>Loading your services…</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>MADE IN INDIA</Text>
        <Text style={styles.flag}>🇮🇳</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 30 },

  logoWrap: {
    width: 150, height: 150, borderRadius: 40, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
    ...shadow.raised,
  },
  logo: { width: 108, height: 108 },

  appName: {
    color: '#FFFFFF', fontSize: typography.h3, fontWeight: typography.bold,
    letterSpacing: 0.3, marginBottom: spacing.md, textAlign: 'center',
  },

  wordmarkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  rule: { width: 28, height: 1.5, backgroundColor: 'rgba(255,255,255,0.65)' },
  wordmark: {
    color: 'rgba(255,255,255,0.95)', fontSize: typography.body, marginHorizontal: 10,
    fontStyle: 'italic', fontWeight: typography.semibold, letterSpacing: 0.5,
  },

  ring: { width: RING * 2 + 12, height: RING * 2 + 12, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  dot: { position: 'absolute', width: 7, height: 7, borderRadius: 4 },

  progressTrack: {
    width: 190, height: 5, borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: '#FFFFFF' },
  loading: { marginTop: spacing.md, color: 'rgba(255,255,255,0.9)', fontSize: typography.small, fontWeight: typography.medium },

  footer: { flexDirection: 'row', alignItems: 'center', position: 'absolute', bottom: 40 },
  footerText: { color: 'rgba(255,255,255,0.9)', fontSize: typography.small, fontWeight: typography.bold, letterSpacing: 1.5 },
  flag: { fontSize: 15, marginLeft: 6 },
});
