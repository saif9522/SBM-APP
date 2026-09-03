import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, Button, Loader } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { paymentUrl } from '../../constants/config';
import donationApi from '../../api/donationApi';
import { currency } from '../../utils/format';
import { friendlyError } from '../../utils/apiHelpers';

/**
 * Opens the real Razorpay checkout page hosted by the Django backend
 * (/pay/donation/<id>/) via Linking. After the user returns, we refetch the
 * donation to reflect the backend-verified status. No payment is faked.
 */
export default function DonationPaymentScreen({ route, navigation }) {
  const { donation } = route.params || {};
  const [status, setStatus] = useState(donation?.status || 'pending');
  const [checking, setChecking] = useState(false);
  const [opened, setOpened] = useState(false);

  const openGateway = useCallback(async () => {
    const url = paymentUrl('donation', donation.id);
    const ok = await Linking.canOpenURL(url).catch(() => false);
    if (!ok) { Alert.alert('Cannot open payment', 'Please try again later.'); return; }
    setOpened(true);
    Linking.openURL(url);
  }, [donation]);

  const refreshStatus = useCallback(async () => {
    setChecking(true);
    try {
      const fresh = await donationApi.donations.get(donation.id);
      setStatus(fresh.status);
      if (fresh.status === 'verified') {
        Alert.alert('Thank you!', 'Your donation has been received.');
      } else if (fresh.status === 'failed') {
        Alert.alert('Payment failed', 'The payment did not go through. You can try again.');
      } else {
        Alert.alert('Still pending', 'We have not received confirmation yet. If you paid, it may take a moment.');
      }
    } catch (err) {
      Alert.alert('Could not check status', friendlyError(err));
    } finally {
      setChecking(false);
    }
  }, [donation]);

  const verified = status === 'verified';

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Payment" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <View style={[styles.circle, verified && { backgroundColor: colors.success }]}>
          <Ionicons name={verified ? 'checkmark' : 'card'} size={40} color="#fff" />
        </View>
        <Text style={styles.amount}>{currency(donation?.amount)}</Text>
        <Text style={styles.sub}>
          {verified
            ? 'Payment verified. Thank you for your support!'
            : 'Complete your payment securely on the next screen. Return here afterwards to confirm.'}
        </Text>

        <Card style={styles.card}>
          <Row label="Reference" value={donation?.id ? `#${donation.id}` : null} />
          <Row label="Status" value={status} />
        </Card>

        <View style={{ flex: 1 }} />

        {checking ? (
          <Loader message="Checking status…" full={false} />
        ) : verified ? (
          <Button title="Done" onPress={() => navigation.popToTop()} />
        ) : (
          <>
            <Button title={opened ? 'Reopen payment page' : 'Pay with Razorpay'} onPress={openGateway} />
            <Button title="I've paid — check status" variant="outline" onPress={refreshStatus} style={{ marginTop: spacing.sm }} />
          </>
        )}
      </View>
    </Screen>
  );
}
function Row({ label, value }) {
  if (!value) return null;
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View>;
}
const styles = StyleSheet.create({
  body: { flex: 1, padding: spacing.xl, alignItems: 'center' },
  circle: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  amount: { fontSize: typography.h1, fontWeight: typography.bold, color: colors.text },
  sub: { fontSize: typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  card: { width: '100%', marginTop: spacing.xl },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  rowLabel: { color: colors.textMuted, fontSize: typography.small },
  rowValue: { color: colors.text, fontSize: typography.small, fontWeight: typography.semibold, textTransform: 'capitalize' },
});
