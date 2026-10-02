import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Header, Loader, ErrorView, EmptyState, Card, StatusBadge } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import bloodApi from '../../api/bloodApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';

export default function MyBloodRequestsScreen({ navigation }) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(() => bloodApi.myBloodRequests(user, { ordering: '-created_at' }), [user?.id, user?.phone]);

  return (
    <Screen edges={[]}>
      <Header title="My Blood Requests" onBack={() => navigation.goBack()} />
      {loading && !data ? <Loader message="Loading…" /> : error ? <ErrorView message={error} onRetry={refetch} /> : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.top}>
                <View style={styles.badge}><Text style={styles.badgeText}>{item.blood_group}</Text></View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.name}>{item.patient_name}</Text>
                  <Text style={styles.meta}>{item.hospital} · {item.units} unit(s)</Text>
                  <Text style={styles.sub}>{formatDate(item.created_at)}{item.urgency === 'urgent' ? ' · Urgent' : ''}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
            </Card>
          )}
          ListEmptyComponent={<EmptyState icon="water-outline" title="No requests yet" message="Your blood requests will show here." actionLabel="Request blood" onAction={() => navigation.navigate('CreateBloodRequest')} />}
        />
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  card: { marginBottom: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center' },
  badge: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: '#FDECEC', alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.danger, fontWeight: typography.bold, fontSize: typography.small },
  name: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  meta: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
  sub: { fontSize: typography.tiny, color: colors.textFaint, marginTop: 2 },
});
