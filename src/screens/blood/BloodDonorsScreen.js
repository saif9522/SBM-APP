import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Header, Loader, ErrorView, EmptyState, Card, ChipGroup } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import bloodApi from '../../api/bloodApi';
import { CHOICES } from '../../constants/endpoints';
import { formatDate } from '../../utils/format';

export default function BloodDonorsScreen({ navigation }) {
  const [group, setGroup] = useState(null);
  const { data, loading, error, refetch } = useApi(() => bloodApi.searchDonors({ blood_group: group || undefined }), [group]);

  // Client-side safety filter (in case the server ignores the query param).
  const donors = useMemo(() => {
    const items = data?.items || [];
    return group ? items.filter((d) => d.blood_group === group) : items;
  }, [data, group]);

  const groupOptions = [{ label: 'All', value: null }, ...CHOICES.bloodGroups.map((g) => ({ label: g, value: g }))];

  return (
    <Screen edges={[]}>
      <Header title="Blood Donors" onBack={() => navigation.goBack()} />
      <View style={styles.filter}>
        <ChipGroup label="Filter by blood group" options={groupOptions} value={group} onChange={setGroup} />
      </View>
      {loading && !data ? (
        <Loader message="Finding donors…" />
      ) : error ? (
        <ErrorView message={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={donors}
          keyExtractor={(d) => String(d.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.card} onPress={() => navigation.navigate('DonorDetails', { donor: item })}>
              <View style={styles.badge}><Text style={styles.badgeText}>{item.blood_group}</Text></View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.address}</Text>
                {item.last_donation_date ? <Text style={styles.sub}>Last donated {formatDate(item.last_donation_date)}</Text> : null}
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState icon="water-outline" title="No donors found" message="Try a different blood group." />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filter: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  list: { padding: spacing.lg, paddingTop: 0, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  badge: { width: 50, height: 50, borderRadius: radius.md, backgroundColor: '#FDECEC', alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.danger, fontWeight: typography.bold, fontSize: typography.body },
  name: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  meta: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
  sub: { fontSize: typography.tiny, color: colors.textFaint, marginTop: 2 },
});
