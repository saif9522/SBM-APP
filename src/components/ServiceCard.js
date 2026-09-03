import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { colors, spacing, typography, radius } from '../constants/theme';
import { currency, mediaUrl } from '../utils/format';

const UNIT_LABEL = {
  per_task: 'per task', per_visit: 'per visit', per_meter: 'per m', per_sq_ft: 'per sq.ft',
  per_day: 'per day', per_month: 'per month', per_year: 'per year', per_unit: 'per unit',
  per_kg: 'per kg', per_km: 'per km', per_booking: 'per booking', per_person: 'per person',
};

export default function ServiceCard({ service, categoryIcon, onPress }) {
  const img = mediaUrl(service?.image);
  return (
    <Card onPress={onPress} padded={false} style={styles.card}>
      <View style={styles.thumb}>
        {img ? (
          <Image source={{ uri: img }} style={styles.img} resizeMode="cover" />
        ) : (
          <Text style={styles.emoji}>{categoryIcon || '📋'}</Text>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{service?.name}</Text>
        {service?.description ? (
          <Text style={styles.desc} numberOfLines={2}>{service.description}</Text>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.price}>{currency(service?.price)}</Text>
          <Text style={styles.unit}>{UNIT_LABEL[service?.unit] || ''}</Text>
          <View style={{ flex: 1 }} />
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', overflow: 'hidden', marginBottom: spacing.md },
  thumb: {
    width: 84, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  img: { width: '100%', height: '100%' },
  emoji: { fontSize: 30 },
  body: { flex: 1, padding: spacing.md },
  name: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  desc: { fontSize: typography.small, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  price: { fontSize: typography.body, fontWeight: typography.bold, color: colors.primary },
  unit: { fontSize: typography.tiny, color: colors.textFaint, marginLeft: spacing.xs },
});
