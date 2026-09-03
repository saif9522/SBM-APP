import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

/** Colours align with the Django models' status semantics. */
const MAP = {
  // complaints / requests
  pending: colors.pending,
  processing: colors.processing,
  resolved: colors.success,
  assigned: colors.info,
  in_progress: colors.processing,
  completed: colors.success,
  cancelled: colors.textFaint,
  // donations
  verified: colors.success,
  failed: colors.danger,
  // blood
  approved: colors.success,
  rejected: colors.danger,
  // pass
  applied: colors.pending,
  expired: colors.textFaint,
  // payment
  paid: colors.success,
  unpaid: colors.pending,
};

export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase();
  const color = MAP[key] || colors.textMuted;
  const label = key ? key.replace(/_/g, ' ') : 'unknown';
  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: spacing.sm },
  text: { fontSize: typography.tiny, fontWeight: typography.semibold, textTransform: 'capitalize' },
});
