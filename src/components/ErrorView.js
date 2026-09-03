import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';
import Button from './Button';

export default function ErrorView({ message = 'Something went wrong.', onRetry }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} />
      <Text style={styles.text}>{message}</Text>
      {onRetry ? (
        <Button title="Try again" variant="outline" onPress={onRetry} fullWidth={false} style={{ marginTop: spacing.lg }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  text: { marginTop: spacing.md, color: colors.textMuted, fontSize: typography.body, textAlign: 'center', lineHeight: 21 },
});
