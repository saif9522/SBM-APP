import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../constants/theme';

/**
 * Single-select chip group.
 * options: [{ label, value }]  |  value: selected value  |  onChange(value)
 */
export default function ChipGroup({ label, options, value, onChange, error }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={String(opt.value)}
              onPress={() => onChange(opt.value)}
              style={[styles.chip, active && styles.chipActive, !!error && !value && styles.chipError]}
            >
              <Text style={[styles.text, active && styles.textActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { fontSize: typography.small, fontWeight: typography.medium, color: colors.textMuted, marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    marginRight: spacing.sm, marginBottom: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipError: { borderColor: colors.danger },
  text: { fontSize: typography.small, color: colors.textMuted },
  textActive: { color: '#fff', fontWeight: typography.semibold },
  err: { color: colors.danger, fontSize: typography.small, marginTop: spacing.xs },
});
