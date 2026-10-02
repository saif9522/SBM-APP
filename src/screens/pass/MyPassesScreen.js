import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Loader, ErrorView, EmptyState, Card, StatusBadge } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import passApi from '../../api/passApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';

const TYPE_LABEL = { bus: 'Bus Pass', auto: 'Auto Pass' };

export default function MyPassesScreen({ navigation }) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(() => passApi.myPasses(user, { ordering: '-created_at' }), [user?.id, user?.phone]);

  return (
    <Screen edges={[]}>
      <Header title="My Passes" onBack={() => navigation.goBack()} />
      {loading && !data ? <Loader message="Loading…" /> : error ? <ErrorView message={error} onRetry={refetch} /> : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card} onPress={() => navigation.navigate('PassDetails', { pass: item })}>
              <View style={styles.top}>
                <View style={styles.icon}><Ionicons name="card" size={22} color={colors.info} /></View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.name}>{TYPE_LABEL[item.pass_type] || item.pass_type} · {item.duration}</Text>
                  <Text style={styles.meta}>{item.holder_name}</Text>
                  {item.pass_id ? <Text style={styles.sub}>{item.pass_id}</Text> : null}
                  {item.valid_upto ? <Text style={styles.sub}>Valid upto {formatDate(item.valid_upto)}</Text> : null}
                </View>
                <StatusBadge status={item.status} />
              </View>
            </Card>
          )}
          ListEmptyComponent={<EmptyState icon="card-outline" title="No passes yet" message="Apply for a pass to see it here." actionLabel="Apply for a pass" onAction={() => navigation.navigate('ApplyPass')} />}
        />
      )}
    </Screen>
  );
}


const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  card: { marginBottom: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: '#E9F0FB', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, textTransform: 'capitalize' },
  meta: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
  sub: { fontSize: typography.tiny, color: colors.textFaint, marginTop: 2 },
});
