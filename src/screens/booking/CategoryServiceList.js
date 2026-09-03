/**
 * Reusable list of bookable services within a category (auto, ambulance…).
 * Used by AutoHome and AmbulanceHome.
 */
import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loader, ErrorView, EmptyState } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { currency } from '../../utils/format';

export default function CategoryServiceList({ query, onSelect, emptyText }) {
  const { data, loading, error, refetch } = query;
  if (loading && !data) return <Loader message="Loading options…" />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <FlatList
      data={data?.items || []}
      keyExtractor={(s) => String(s.id)}
      contentContainerStyle={styles.list}
      refreshing={loading}
      onRefresh={refetch}
      renderItem={({ item }) => (
        <Card onPress={() => onSelect(item)} style={styles.row}>
          <View style={styles.iconWrap}>
            <Text style={styles.emoji}>{(data?.category?.icon || '').split(' ')[0] || '🚗'}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
            <Text style={styles.price}>{currency(item.price)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </Card>
      )}
      ListEmptyComponent={
        <EmptyState icon="cube-outline" title="Nothing available yet" message={emptyText} />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  iconWrap: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  name: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  desc: { fontSize: typography.small, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  price: { fontSize: typography.body, fontWeight: typography.bold, color: colors.primary, marginTop: spacing.xs },
});
