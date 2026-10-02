import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Header, Button, Card } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { fees as fetchFees, feeText, feeRequired } from '../../api/paymentApi';

export default function JobDetailsScreen({ route, navigation }) {
  const { position } = route.params || {};
  const insets = useSafeAreaInsets();
  const [fee, setFee] = useState(null);
  useEffect(() => { fetchFees().then((d) => setFee(d?.career ?? null)).catch(() => {}); }, []);
  const feeLabel = feeText(fee);
  return (
    <Screen edges={[]}>
      <Header title="Position" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>{position?.label}</Text>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>About the role</Text>
          <Text style={styles.text}>
            Join the Swachh Bharat Mission Foundation as a {position?.label}. This role
            contributes to cleanliness and community-welfare initiatives across the region.
            Submit your application with your resume and required documents; the team will
            review and contact shortlisted candidates.
          </Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>What you'll need</Text>
          {['Resume / CV', 'Aadhaar document', 'Basic details & qualification',
            ...(feeRequired(fee) ? [`One-time joining fee${feeLabel ? ` ${feeLabel}` : ''} (UPI / card via Razorpay)`] : [])].map((t) => (
            <View key={t} style={styles.li}><Ionicons name="checkmark-circle" size={16} color={colors.primary} /><Text style={styles.liText}>{t}</Text></View>
          ))}
        </Card>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button title={feeLabel ? `Apply now · Fee ${feeLabel}` : 'Apply now'} onPress={() => navigation.navigate('ApplyJob', { position })} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  title: { fontSize: typography.h2, fontWeight: typography.bold, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, marginBottom: spacing.sm },
  text: { fontSize: typography.body, color: colors.textMuted, lineHeight: 22 },
  li: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  liText: { marginLeft: spacing.sm, fontSize: typography.small, color: colors.textMuted },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.surface },
});
