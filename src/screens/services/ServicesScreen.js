import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Loader, ErrorView, EmptyState, ServiceCard } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import serviceApi from '../../api/serviceApi';

export default function ServicesScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState(null); // category id

  const cats = useApi(() => serviceApi.listCategories(), []);
  const svc = useApi(
    () => serviceApi.listServices({ search: search.trim() || undefined, category: activeCat || undefined }),
    [activeCat] // search triggers via submit
  );

  const catIcon = useMemo(() => {
    const map = {};
    (cats.data?.items || []).forEach((c) => { map[c.id] = c.icon; });
    return map;
  }, [cats.data]);

  const onSearchSubmit = useCallback(() => svc.refetch(), [svc]);

  const renderHeader = () => (
    <View>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={colors.textFaint} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
          placeholder="Search services…"
          placeholderTextColor={colors.textFaint}
          style={styles.searchInput}
        />
        {search ? (
          <Pressable onPress={() => { setSearch(''); setTimeout(svc.refetch, 0); }} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textFaint} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={[{ id: null, name: 'All', icon: '🗂️' }, ...(cats.data?.items || [])]}
        keyExtractor={(c) => String(c.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: spacing.md }}
        renderItem={({ item }) => {
          const active = activeCat === item.id;
          return (
            <Pressable
              onPress={() => setActiveCat(item.id)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item.icon} {item.name}
              </Text>
            </Pressable>
          );
        }}
      />
      <Text style={styles.sectionTitle}>
        {svc.data ? `${svc.data.count} service${svc.data.count === 1 ? '' : 's'}` : 'Services'}
      </Text>
    </View>
  );

  return (
    <Screen edges={['top', 'bottom']}>
      <Header
        title="Services"
        right={
          <Pressable onPress={() => navigation.navigate('MyApplications')} hitSlop={10}>
            <Ionicons name="document-text-outline" size={22} color={colors.text} />
          </Pressable>
        }
      />
      {svc.loading && !svc.data ? (
        <Loader message="Loading services…" />
      ) : svc.error ? (
        <ErrorView message={svc.error} onRetry={svc.refetch} />
      ) : (
        <FlatList
          data={svc.data?.items || []}
          keyExtractor={(s) => String(s.id)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              categoryIcon={catIcon[item.category]}
              onPress={() => navigation.navigate('ServiceDetails', { service: item, categoryIcon: catIcon[item.category] })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No services found"
              message="Try a different search or category."
            />
          }
          refreshing={svc.loading}
          onRefresh={svc.refetch}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingTop: spacing.md, flexGrow: 1 },
  search: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.md, paddingHorizontal: spacing.lg, minHeight: 48,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, marginHorizontal: spacing.sm, fontSize: typography.body, color: colors.text },
  chip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: typography.small, color: colors.textMuted },
  chipTextActive: { color: '#fff', fontWeight: typography.semibold },
  sectionTitle: { fontSize: typography.small, color: colors.textMuted, marginBottom: spacing.md },
});
