import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Header, Loader, ErrorView, EmptyState, Card, StatusBadge } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import donationApi from '../../api/donationApi';
import { useAuth } from '../../context/AuthContext';
import { currency, formatDate } from '../../utils/format';

export default function DonationHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(() => donationApi.myDonations(user), [user?.id, user?.phone]);

  return (
    <Screen edges={[]}>
      <Header title="Donation History" onBack={() => navigation.goBack()} />
      {loading && !data ? <Loader message="Loading…" /> : error ? <ErrorView message={error} onRetry={refetch} /> : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(d) => String(d.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.top}>
                <Text style={styles.amount}>{currency(item.amount)}</Text>
                <StatusBadge status={item.status} />
              </View>
              {item.purpose ? <Text style={styles.purpose}>{item.purpose}</Text> : null}
              <Text style={styles.meta}>{formatDate(item.created_at)}</Text>
            </Card>
          )}
          ListEmptyComponent={<EmptyState icon="heart-outline" title="No donations yet" message="Your donations will appear here." actionLabel="Donate now" onAction={() => navigation.navigate('DonationForm')} />}
        />
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  card: { marginBottom: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amount: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.primary },
  purpose: { fontSize: typography.small, color: colors.textMuted, marginTop: spacing.sm },
  meta: { fontSize: typography.tiny, color: colors.textFaint, marginTop: spacing.sm },
});
