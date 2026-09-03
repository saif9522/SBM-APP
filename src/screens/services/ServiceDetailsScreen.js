import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Button, Card } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { currency, mediaUrl } from '../../utils/format';

const UNIT_LABEL = {
  per_task: 'per task', per_visit: 'per visit', per_meter: 'per meter', per_sq_ft: 'per sq.ft',
  per_day: 'per day', per_month: 'per month', per_year: 'per year', per_unit: 'per unit',
  per_kg: 'per kg', per_km: 'per km', per_booking: 'per booking', per_person: 'per person',
};

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ServiceDetailsScreen({ route, navigation }) {
  const { service, categoryIcon } = route.params || {};
  const img = mediaUrl(service?.image);

  return (
    <Screen edges={['top']}>
      <Header title="Service details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          {img ? (
            <Image source={{ uri: img }} style={styles.heroImg} resizeMode="cover" />
          ) : (
            <Text style={styles.heroEmoji}>{categoryIcon || '📋'}</Text>
          )}
        </View>

        <Text style={styles.name}>{service?.name}</Text>
        {service?.name_hi ? <Text style={styles.nameHi}>{service.name_hi}</Text> : null}

        <View style={styles.priceRow}>
          <Text style={styles.price}>{currency(service?.price)}</Text>
          <Text style={styles.unit}>{UNIT_LABEL[service?.unit] || ''}</Text>
        </View>

        {service?.description ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.desc}>{service.description}</Text>
          </Card>
        ) : null}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <InfoRow icon="pricetag-outline" label="Price" value={`${currency(service?.price)} ${UNIT_LABEL[service?.unit] || ''}`} />
          <InfoRow icon="time-outline" label="Duration" value={service?.duration_days ? `${service.duration_days} day(s)` : null} />
          <InfoRow icon="checkmark-circle-outline" label="Status" value={service?.is_active ? 'Available' : 'Unavailable'} />
        </Card>

        <View style={{ height: 90 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Apply for this service"
          onPress={() => navigation.navigate('ServiceApplication', { service })}
          disabled={!service?.is_active}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  hero: {
    height: 180, borderRadius: radius.lg, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: spacing.lg,
  },
  heroImg: { width: '100%', height: '100%' },
  heroEmoji: { fontSize: 64 },
  name: { fontSize: typography.h2, fontWeight: typography.bold, color: colors.text },
  nameHi: { fontSize: typography.body, color: colors.textMuted, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.sm },
  price: { fontSize: typography.h2, fontWeight: typography.bold, color: colors.primary },
  unit: { fontSize: typography.small, color: colors.textFaint, marginLeft: spacing.sm },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, marginBottom: spacing.md },
  desc: { fontSize: typography.body, color: colors.textMuted, lineHeight: 22 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  infoLabel: { marginLeft: spacing.md, fontSize: typography.small, color: colors.textMuted, width: 80 },
  infoValue: { flex: 1, fontSize: typography.small, color: colors.text, fontWeight: typography.medium, textAlign: 'right' },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.surface },
});
