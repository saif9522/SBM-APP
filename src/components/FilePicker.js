import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, typography, radius } from '../constants/theme';

/**
 * Document/CV picker (PDF or image). Returns a picker asset via onPick.
 * Falls back gracefully if the module isn't installed.
 */
export default function FilePicker({ label, value, onPick, error, accept = ['application/pdf', 'image/*'] }) {
  const pick = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: accept, copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.length) onPick(res.assets[0]);
    } catch (e) { /* no-op */ }
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={[styles.box, !!error && styles.boxError, !!value && styles.boxFilled]} onPress={pick}>
        <Ionicons name={value ? 'document-attach' : 'cloud-upload-outline'} size={20} color={value ? colors.primary : colors.textFaint} />
        <Text style={[styles.text, value && { color: colors.text }]} numberOfLines={1}>
          {value?.name || 'Choose file (PDF or image)'}
        </Text>
        {value ? <Ionicons name="checkmark-circle" size={18} color={colors.success} /> : null}
      </Pressable>
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { fontSize: typography.small, fontWeight: typography.medium, color: colors.textMuted, marginBottom: spacing.sm },
  box: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.md, paddingHorizontal: spacing.lg, minHeight: 50 },
  boxFilled: { borderStyle: 'solid', borderColor: colors.primary },
  boxError: { borderColor: colors.danger },
  text: { flex: 1, marginHorizontal: spacing.sm, fontSize: typography.small, color: colors.textFaint },
  err: { color: colors.danger, fontSize: typography.small, marginTop: spacing.xs },
});
