import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, shadow } from '../constants/theme';

export default function Card({ children, onPress, style, padded = true, raised = false }) {
  const content = (
    <View style={[styles.card, raised ? shadow.raised : shadow.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.9 }}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg },
  padded: { padding: spacing.lg },
});
