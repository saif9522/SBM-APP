import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadow } from '../constants/theme';
import { currency, mediaUrl } from '../utils/format';

const UNIT_LABEL = {
  per_task: 'per task', per_visit: 'per visit', per_meter: 'per m', per_sq_ft: 'per sq.ft',
  per_day: 'per day', per_month: 'per month', per_year: 'per year', per_unit: 'per unit',
  per_kg: 'per kg', per_km: 'per km', per_booking: 'per booking', per_person: 'per person',
};

export default function ServiceCard({ service, categoryIcon, categoryName, onPress }) {
  const img = mediaUrl(service?.image);
  const unit = UNIT_LABEL[service?.unit] || '';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.thumb}>
        {img ? (
          <Image source={{ uri: img }} style={styles.img} resizeMode="cover" />
        ) : categoryIcon ? (
          <Text style={styles.emoji}>{categoryIcon}</Text>
        ) : (
          <Ionicons name="construct-outline" size={26} color={colors.primary} />
        )}
      </View>

      <View style={styles.body}>
        {categoryName ? (
          <View style={styles.tag}>
            <Text style={styles.tagText} numberOfLines={1}>{categoryName}</Text>
          </View>
        ) : null}
        <Text style={styles.name} numberOfLines={2}>{service?.name}</Text>
        {service?.description ? (
          <Text style={styles.desc} numberOfLines={2}>{service.description}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <View style={styles.pricePill}>
            <Text style={styles.price}>{currency(service?.price)}</Text>
          </View>
          {unit ? <Text style={styles.unit}>{unit}</Text> : null}
        </View>
      </View>

      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
  thumb: {
    width: 64, height: 64, borderRadius: radius.md,
    backgroundColor: colors.primarySoft, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  img: { width: '100%', height: '100%' },
  emoji: { fontSize: 30 },
  body: { flex: 1, marginLeft: spacing.md },
  tag: {
    alignSelf: 'flex-start', backgroundColor: colors.primaryLight,
    borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2, marginBottom: 4,
  },
  tagText: { fontSize: typography.tiny, color: colors.primaryDark, fontWeight: typography.semibold },
  name: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  desc: { fontSize: typography.small, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  pricePill: {
    backgroundColor: `${colors.primary}14`, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: 3,
  },
  price: { fontSize: typography.small, fontWeight: typography.bold, color: colors.primaryDark },
  unit: { fontSize: typography.tiny, color: colors.textFaint, marginLeft: spacing.sm },
  chevron: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginLeft: spacing.sm,
  },
});
