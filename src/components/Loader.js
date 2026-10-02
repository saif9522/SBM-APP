import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';
import useSectionTheme from '../hooks/useSectionTheme';

export default function Loader({ message = 'Loading…', full = true }) {
  const theme = useSectionTheme();
  return (
    <View style={[styles.wrap, full && styles.full]}>
      <ActivityIndicator size="large" color={theme.tint} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  full: { flex: 1 },
  text: { marginTop: spacing.md, color: colors.textMuted, fontSize: typography.small },
});
