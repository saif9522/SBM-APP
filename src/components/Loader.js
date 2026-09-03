import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

export default function Loader({ message = 'Loading…', full = true }) {
  return (
    <View style={[styles.wrap, full && styles.full]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  full: { flex: 1, backgroundColor: colors.bg },
  text: { marginTop: spacing.md, color: colors.textMuted, fontSize: typography.small },
});
