import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, Button, Loader, PaymentModal } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { paymentUrl } from '../../constants/config';
import donationApi from '../../api/donationApi';
import { paymentStatus } from '../../api/paymentApi';
import { currency } from '../../utils/format';
import { friendlyError } from '../../utils/apiHelpers';

/**
 * Razorpay checkout ab app ke andar (WebView) khulta hai — backend ki hosted
 * /pay/donation/<id>/ page. Payment ke baad status API se verify hota hai.
 */
export default function DonationPaymentScreen({ route, navigation }) {
  const { donation } = route.params || {};
  const [status, setStatus] = useState(donation?.status || 'pending');
  const [checking, setChecking] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const openGateway = useCallback(() => setPayOpen(true), []);

  const refreshStatus = useCallback(async (silent = false) => {
    setChecking(true);
    try {
      // Server checks with Razorpay and records a payment it missed.
      try { await paymentStatus('donation', donation.id); } catch { /* fall through to read */ }
      const fresh = await donationApi.donations.get(donation.id);
      setStatus(fresh.status);
      if (fresh.status === 'verified') {
        Alert.alert('Thank you!', 'Your donation has been received.');
      } else if (fresh.status === 'failed') {
        Alert.alert('Payment failed', 'The payment did not go through. You can try again.');
      } else if (!silent) {
        Alert.alert('Still pending', 'We have not received confirmation yet. If you paid, it may take a moment.');
      }
    } catch (err) {
      if (!silent) Alert.alert('Could not check status', friendlyError(err));
    } finally {
      setChecking(false);
    }
  }, [donation]);

  // Sheet closed for ANY reason (done, ✕, back, returned from GPay) →
  // always re-read the real status from the server.
  const onPayClosed = useCallback(() => {
    setPayOpen(false);
    refreshStatus(true);
  }, [refreshStatus]);

  const verified = status === 'verified';

  return (
    <Screen edges={['bottom']}>
      <Header title="Payment" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <View style={[styles.circle, verified && { backgroundColor: colors.success }]}>
          <Ionicons name={verified ? 'checkmark' : 'card'} size={40} color="#fff" />
        </View>
        <Text style={styles.amount}>{currency(donation?.amount)}</Text>
        <Text style={styles.sub}>
          {verified
            ? 'Payment verified. Thank you for your support!'
            : 'Pay securely with Razorpay — the checkout opens right here in the app.'}
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
            <Button title="Pay with Razorpay" onPress={openGateway} icon={<Ionicons name="card-outline" size={18} color="#fff" />} />
            <Button title="I've paid — check status" variant="outline" onPress={() => refreshStatus(false)} style={{ marginTop: spacing.sm }} />
          </>
        )}
      </View>

      <PaymentModal
        visible={payOpen}
        kind="donation"
        refId={donation?.id}
        url={paymentUrl('donation', donation?.id)}
        onClose={onPayClosed}
      />
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
