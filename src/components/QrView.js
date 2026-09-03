import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../constants/theme';

/**
 * Renders a QR code for the given value. Uses react-native-qrcode-svg when
 * installed; otherwise falls back to showing the code as text so the app never
 * crashes. To enable real QR codes:
 *    npx expo install react-native-svg
 *    npm install react-native-qrcode-svg
 */
let QRCode = null;
try {
  // eslint-disable-next-line global-require
  QRCode = require('react-native-qrcode-svg').default;
} catch (e) {
  QRCode = null;
}

export default function QrView({ value, size = 180 }) {
  if (!value) return null;
  if (QRCode) {
    return (
      <View style={styles.wrap}>
        <QRCode value={String(value)} size={size} color={colors.text} backgroundColor="#fff" />
      </View>
    );
  }
  return (
    <View style={[styles.fallback, { width: size, height: size }]}>
      <Text style={styles.fallbackLabel}>Pass code</Text>
      <Text style={styles.fallbackCode}>{value}</Text>
      <Text style={styles.fallbackHint}>Install react-native-qrcode-svg to show a scannable QR.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.md, backgroundColor: '#fff', borderRadius: radius.md, alignSelf: 'center' },
  fallback: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  fallbackLabel: { fontSize: typography.tiny, color: colors.textFaint },
  fallbackCode: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.text, marginVertical: spacing.sm, textAlign: 'center' },
  fallbackHint: { fontSize: typography.tiny, color: colors.textFaint, textAlign: 'center' },
});
