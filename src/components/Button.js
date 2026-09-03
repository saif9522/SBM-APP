import React from 'react';
import { Text, Pressable, ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

/**
 * variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * Disabled + loading states are handled here so screens never double-submit.
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon = null,
  style,
  fullWidth = true,
}) {
  const isDisabled = disabled || loading;
  const v = VARIANTS[variant] || VARIANTS.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        v.container,
        fullWidth && { alignSelf: 'stretch' },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.label.color} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.label, v.label, icon ? { marginLeft: spacing.sm } : null]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const VARIANTS = {
  primary: {
    container: { backgroundColor: colors.primary },
    label: { color: colors.onPrimary },
  },
  secondary: {
    container: { backgroundColor: colors.primaryLight },
    label: { color: colors.primaryDark },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    label: { color: colors.primary },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    label: { color: colors.primary },
  },
  danger: {
    container: { backgroundColor: colors.danger },
    label: { color: '#fff' },
  },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 50, // >= 44px touch target
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: typography.body, fontWeight: typography.semibold },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
