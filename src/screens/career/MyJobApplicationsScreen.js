import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Header, Loader, ErrorView, EmptyState, Card, StatusBadge, Button, PaymentModal } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import careerApi, { POSITIONS } from '../../api/careerApi';
import { fees as fetchFees, feeText, feeRequired } from '../../api/paymentApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';

const LABEL = Object.fromEntries(POSITIONS.map((p) => [p.value, p.label]));

/**
 * My job applications — now with the joining-fee status on every card and
 * a "Pay" button for any application whose fee is still pending. Paying
 * here (or having paid in GPay / the browser earlier) is confirmed with the
 * server, which checks Razorpay directly.
 */
export default function MyJobApplicationsScreen() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(
    () => careerApi.myApplications(user, { ordering: '-created_at' }),
    [user?.id, user?.phone],
  );
  const [fee, setFee] = useState(null);
  const [payFor, setPayFor] = useState(null);

  useEffect(() => { fetchFees().then((d) => setFee(d?.career ?? null)).catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const feeLabel = feeText(fee);

  const onPayClosed = async (paidByServer) => {
    const id = payFor;
    setPayFor(null);
    const res = await refetch();
    const row = (res?.items || []).find((a) => a.id === id);
    if (paidByServer || row?.payment_status === 'paid') {
      Alert.alert('Payment received ✅', `Joining fee${feeLabel ? ` ${feeLabel}` : ''} received. Thank you!`);
    }
  };

  return (
    <Screen edges={['bottom']}>
      <Header title="My Applications" />
      {loading && !data ? <Loader message="Loading…" /> : error ? <ErrorView message={error} onRetry={refetch} /> : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(a) => String(a.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={refetch}
          renderItem={({ item }) => {
            const paid = item.payment_status === 'paid';
            const needsFee = !paid && feeRequired(fee);
            return (
              <Card style={styles.card}>
                <View style={styles.top}>
                  <Text style={styles.role}>{LABEL[item.applied_position] || item.applied_position}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={styles.meta}>{item.first_name} {item.last_name} · {formatDate(item.created_at)}</Text>

                <View style={[styles.feeRow, paid ? styles.feePaid : styles.feeDue]}>
                  <Text style={[styles.feeText, { color: paid ? colors.success : colors.pending }]}>
                    {paid
                      ? `Joining fee paid${item.amount_paid ? ` · ₹${Number(item.amount_paid).toLocaleString('en-IN')}` : ''}`
                      : `Joining fee pending${feeLabel ? ` · ${feeLabel}` : ''}`}
                  </Text>
                </View>

                {needsFee ? (
                  <Button
                    title={feeLabel ? `Pay ${feeLabel}` : 'Pay joining fee'}
                    onPress={() => setPayFor(item.id)}
                    style={{ marginTop: spacing.md }}
                  />
                ) : null}
              </Card>
            );
          }}
          ListEmptyComponent={<EmptyState icon="briefcase-outline" title="No applications yet" message="Roles you apply for will appear here." />}
        />
      )}

      <PaymentModal visible={!!payFor} kind="career" refId={payFor} onClose={onPayClosed} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  card: { marginBottom: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  role: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, flex: 1, marginRight: spacing.md },
  meta: { fontSize: typography.small, color: colors.textMuted, marginTop: spacing.sm },
  feeRow: { marginTop: spacing.md, paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  feePaid: { backgroundColor: '#E7F4E6' },
  feeDue: { backgroundColor: '#FFF1E6' },
  feeText: { fontSize: typography.small, fontWeight: typography.semibold },
});
