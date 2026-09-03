import React, { useEffect, useRef } from 'react';
import { View, Text, Image, ImageBackground, Animated, Easing, StyleSheet } from 'react-native';
import { LOGO, SPLASH_BG } from '../../constants/assets';

/**
 * Themed launch screen: dark indigo -> warm-orange glow background, the
 * Foundation logo, a "Welcome to SBM" wordmark, an animated ring of dots,
 * and a MADE IN INDIA footer. Shown while auth bootstraps.
 */
const DOT_COLORS = ['#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#F97316', '#EA580C', '#FB923C', '#FDBA74'];
const RING = 26; // radius of the dot ring

export default function SplashScreen() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <ImageBackground source={SPLASH_BG} style={styles.bg} resizeMode="cover">
      <View style={styles.center}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.wordmarkRow}>
        <View style={styles.rule} />
        <Text style={styles.wordmark}>Welcome to SBM</Text>
        <View style={styles.rule} />
      </View>

      {/* animated ring of dots */}
      <Animated.View style={[styles.ring, { transform: [{ rotate }] }]}>
        {DOT_COLORS.map((c, i) => {
          const angle = (i / DOT_COLORS.length) * 2 * Math.PI;
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

      <View style={styles.footer}>
        <Text style={styles.footerText}>MADE IN INDIA</Text>
        <Text style={styles.flag}>🇮🇳</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  logo: { width: 190, height: 190 },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 60 },
  rule: { width: 34, height: 1, backgroundColor: 'rgba(255,255,255,0.7)' },
  wordmark: {
    color: '#fff', fontSize: 24, marginHorizontal: 12,
    fontStyle: 'italic', fontWeight: '600', letterSpacing: 0.5,
  },
  ring: { width: RING * 2 + 12, height: RING * 2 + 12, alignItems: 'center', justifyContent: 'center', marginBottom: 60 },
  dot: { position: 'absolute', width: 7, height: 7, borderRadius: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', position: 'absolute', bottom: 40 },
  footerText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  flag: { fontSize: 15, marginLeft: 6 },
});
