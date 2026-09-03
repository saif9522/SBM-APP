import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppModal from './AppModal';
import Button from './Button';
import { colors, spacing, typography } from '../constants/theme';

export default function ConfirmDialog({
  visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  destructive = false, loading = false, onConfirm, onCancel,
}) {
  return (
    <AppModal visible={visible} onClose={onCancel}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <View style={styles.actions}>
        <Button title={cancelLabel} variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
        <View style={{ width: spacing.md }} />
        <Button title={confirmLabel} variant={destructive ? 'danger' : 'primary'} loading={loading} onPress={onConfirm} style={{ flex: 1 }} />
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.text, marginBottom: spacing.sm },
  message: { fontSize: typography.body, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.lg },
  actions: { flexDirection: 'row' },
});
