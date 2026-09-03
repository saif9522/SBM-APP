import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, Button } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { formatDate } from '../../utils/format';

function Row({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function DonorDetailsScreen({ route, navigation }) {
  const { donor } = route.params || {};
  const call = () => {
    if (!donor?.phone) return;
    const url = `tel:${donor.phone}`;
    Linking.canOpenURL(url).then((ok) => ok ? Linking.openURL(url) : Alert.alert('Cannot call'));
  };

  return (
    <Screen edges={['top']}>
      <Header title="Donor details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.head}>
          <View style={styles.badge}><Text style={styles.badgeText}>{donor?.blood_group}</Text></View>
          <Text style={styles.name}>{donor?.name}</Text>
        </View>

        <Card style={styles.section}>
          <Row label="Gender" value={donor?.gender} />
          <Row label="Age" value={donor?.age ? `${donor.age} yrs` : null} />
          <Row label="Address" value={donor?.address} />
          <Row label="Ward" value={donor?.ward_no} />
          <Row label="Last donation" value={donor?.last_donation_date ? formatDate(donor.last_donation_date) : 'Not recorded'} />
        </Card>

        <View style={{ flex: 1 }} />
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Call donor" icon={<Ionicons name="call" size={18} color="#fff" />} onPress={call} disabled={!donor?.phone} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, flexGrow: 1 },
  head: { alignItems: 'center', marginVertical: spacing.lg },
  badge: { width: 72, height: 72, borderRadius: radius.lg, backgroundColor: '#FDECEC', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  badgeText: { color: colors.danger, fontWeight: typography.bold, fontSize: typography.h2 },
  name: { fontSize: typography.h2, fontWeight: typography.bold, color: colors.text },
  section: { marginTop: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  label: { color: colors.textMuted, fontSize: typography.small },
  value: { color: colors.text, fontSize: typography.small, fontWeight: typography.medium, flex: 1, textAlign: 'right', marginLeft: spacing.lg, textTransform: 'capitalize' },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.surface },
});
