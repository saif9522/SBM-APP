import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Header, Card, StatusBadge, Button, PaymentModal } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { currency, formatDate, mediaUrl } from '../../utils/format';
import { paymentUrl } from '../../constants/config';
import serviceApi from '../../api/serviceApi';
import { downloadServiceBill } from '../../utils/receipt';

function Row({ label, value, capitalize }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, capitalize && { textTransform: 'capitalize' }]}>{value}</Text>
    </View>
  );
}

export default function BookingDetailsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [r, setR] = useState(route.params?.request || {});
  const [payOpen, setPayOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const img = mediaUrl(r?.image);

  const refresh = useCallback(async () => {
    if (!r?.id) return;
    try {
      const fresh = await serviceApi.serviceRequests.get(r.id);
      setR(fresh);
    } catch { /* keep current */ }
  }, [r?.id]);

  useEffect(() => { refresh(); }, []); // latest status on open

  const isPaid = r?.payment_status === 'paid';
  const needsPay = !isPaid && Number(r?.total_price || 0) > 0;

  const onPayClosed = useCallback(() => {
    setPayOpen(false);
    refresh(); // server has already checked Razorpay — show the real status
  }, [refresh]);

  const onDownload = async () => {
    setBusy(true);
    await downloadServiceBill(r, route.params?.service?.name);
    setBusy(false);
  };

  return (
    <Screen edges={[]}>
      <Header title="Booking details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={styles.head}>
          <Text style={styles.ref}>{r?.request_no || `#${r?.id}`}</Text>
          <StatusBadge status={r?.status} />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Row label="Quantity" value={r?.quantity} />
          <Row label="Amount" value={currency(r?.total_price)} />
          <Row label="Payment" value={r?.payment_status} capitalize />
          <Row label="Created" value={formatDate(r?.created_at)} />
          {r?.preferred_date ? <Row label="Preferred" value={formatDate(r.preferred_date)} /> : null}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Row label="Address" value={r?.address} />
          {r?.gps_latitude ? <Row label="GPS" value={`${r.gps_latitude}, ${r.gps_longitude}`} /> : null}
        </Card>

        {r?.notes ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{r.notes}</Text>
          </Card>
        ) : null}

        {img ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Attachment</Text>
            <Image source={{ uri: img }} style={styles.img} resizeMode="cover" />
          </Card>
        ) : null}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Action bar */}
      {(needsPay || isPaid) ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          {needsPay ? (
            <Button title={`Pay ${currency(r?.total_price)} with Razorpay`} onPress={() => setPayOpen(true)} />
          ) : (
            <Button title="Download Bill (PDF)" onPress={onDownload} loading={busy} />
          )}
        </View>
      ) : null}

      <PaymentModal
        visible={payOpen}
        kind="service"
        refId={r?.id}
        url={paymentUrl('service', r?.id)}
        onClose={onPayClosed}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ref: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.text },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  label: { color: colors.textMuted, fontSize: typography.small },
  value: { color: colors.text, fontSize: typography.small, fontWeight: typography.medium, flex: 1, textAlign: 'right', marginLeft: spacing.lg },
  notes: { color: colors.textMuted, fontSize: typography.body, lineHeight: 22 },
  img: { width: '100%', height: 200, borderRadius: 12 },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.surface },
});
