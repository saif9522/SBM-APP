import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Header, Loader, ErrorView, EmptyState, Card, StatusBadge } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import complaintApi from '../../api/complaintApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';

const LABEL = { light: 'Light', water: 'Water', garbage: 'Garbage', drainage: 'Drainage', toilet: 'Toilet', road: 'Road', street_light: 'Street Light', park: 'Park', other: 'Other' };

export default function MyComplaintsScreen({ navigation }) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(() => complaintApi.myComplaints(user), [user?.id, user?.phone]);

  return (
    <Screen edges={[]}>
      <Header title="My Complaints" onBack={navigation?.canGoBack?.() ? () => navigation.goBack() : undefined} />
      {loading && !data ? <Loader message="Loading…" /> : error ? <ErrorView message={error} onRetry={refetch} /> : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card} onPress={() => navigation.navigate('ComplaintDetails', { complaint: item })}>
              <View style={styles.top}>
                <Text style={styles.type}>{LABEL[item.complaint_type] || item.complaint_type}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.meta}>#{item.id} · {formatDate(item.created_at)}</Text>
            </Card>
          )}
          ListEmptyComponent={<EmptyState icon="megaphone-outline" title="No complaints yet" message="Issues you report will appear here." actionLabel="File a complaint" onAction={() => navigation.navigate('NewComplaint')} />}
        />
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  card: { marginBottom: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  type: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  desc: { fontSize: typography.small, color: colors.textMuted, lineHeight: 19 },
  meta: { fontSize: typography.tiny, color: colors.textFaint, marginTop: spacing.sm },
});
