import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Header, Loader, ErrorView, EmptyState, Card, StatusBadge } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import careerApi, { POSITIONS } from '../../api/careerApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';

const LABEL = Object.fromEntries(POSITIONS.map((p) => [p.value, p.label]));

export default function MyJobApplicationsScreen({ navigation }) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(() => careerApi.myApplications(user?.id, { ordering: '-created_at' }), [user?.id]);

  return (
    <Screen edges={['top']}>
      <Header title="My Applications" onBack={() => navigation.goBack()} />
      {loading && !data ? <Loader message="Loading…" /> : error ? <ErrorView message={error} onRetry={refetch} /> : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(a) => String(a.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.top}>
                <Text style={styles.role}>{LABEL[item.applied_position] || item.applied_position}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.meta}>{item.first_name} {item.last_name} · {formatDate(item.created_at)}</Text>
            </Card>
          )}
          ListEmptyComponent={<EmptyState icon="briefcase-outline" title="No applications yet" message="Roles you apply for will appear here." actionLabel="Browse careers" onAction={() => navigation.navigate('CareerHome')} />}
        />
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  card: { marginBottom: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  role: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, flex: 1, marginRight: spacing.md },
  meta: { fontSize: typography.small, color: colors.textMuted, marginTop: spacing.sm },
});
