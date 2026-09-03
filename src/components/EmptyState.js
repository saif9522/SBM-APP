import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';
import Button from './Button';

/** Every list screen uses this. Empty screens are an invitation to act. */
export default function EmptyState({
  icon = 'file-tray-outline',
  title = 'Nothing here yet',
  message,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={40} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} fullWidth={false} style={{ marginTop: spacing.lg }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  iconWrap: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  title: { fontSize: typography.h3, fontWeight: typography.semibold, color: colors.text, textAlign: 'center' },
  message: { fontSize: typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
});
