import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Header, Loader, ErrorView, EmptyState, Card, StatusBadge } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import serviceApi from '../../api/serviceApi';
import { useAuth } from '../../context/AuthContext';
import { currency, formatDate } from '../../utils/format';

export default function BookingsScreen({ navigation }) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(
    () => serviceApi.myRequests(user, { ordering: '-created_at' }),
    [user?.id, user?.phone]
  );

  return (
    <Screen edges={['bottom']}>
      <Header title="My Bookings" />
      {loading && !data ? (
        <Loader message="Loading bookings…" />
      ) : error ? (
        <ErrorView message={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card} onPress={() => navigation.navigate('BookingDetails', { request: item })}>
              <View style={styles.top}>
                <Text style={styles.ref}>{item.request_no || `#${item.id}`}</Text>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{formatDate(item.created_at)}</Text>
                <View style={{ flex: 1 }} />
                <Text style={styles.price}>{currency(item.total_price)}</Text>
              </View>
              {item.address ? <Text style={styles.addr} numberOfLines={1}>📍 {item.address}</Text> : null}
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="briefcase-outline"
              title="No bookings yet"
              message="Your auto, ambulance and service bookings will appear here."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  card: { marginBottom: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ref: { fontSize: typography.body, fontWeight: typography.bold, color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  meta: { fontSize: typography.small, color: colors.textMuted },
  price: { fontSize: typography.body, fontWeight: typography.bold, color: colors.primary },
  addr: { fontSize: typography.small, color: colors.textFaint, marginTop: spacing.sm },
});
