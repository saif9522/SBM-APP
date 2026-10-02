import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Loader, ErrorView, EmptyState, ServiceCard } from '../../components';
import { colors, spacing, typography, radius, shadow } from '../../constants/theme';
import { SECTION_THEMES } from '../../constants/sectionThemes';
import useApi from '../../hooks/useApi';
import serviceApi, { listAllServices, sortCategories } from '../../api/serviceApi';

/**
 * SEARCH — kya theek kiya
 * ------------------------
 * 1. Search box pehle FlatList ke `ListHeaderComponent` me ek function ke
 *    roop me tha. Har akshar type karne par wo function naya banta tha,
 *    React poora header unmount/remount karta tha, aur TextInput ka focus
 *    chala jaata tha — ek akshar ke baad keyboard band. Ab search box list
 *    ke BAHAR, upar fixed hai.
 * 2. Home ka search box sirf yahan le aata tha, keyboard nahi kholta tha.
 *    Ab `focusSearch` param aate hi input par focus ho jaata hai.
 * 3. Matching: ab Hindi naam (name_hi), category ka naam bhi search hota
 *    hai, aur har shabd alag se match hota hai ("kachra ward" → dono shabd).
 * 4. "blood", "khoon", "pass", "naukri" jaise shabd ab seedha us section ka
 *    shortcut dikhate hain — ye services list me nahi the, isliye pehle
 *    "No services found" aata tha.
 */

// Features jo "service" nahi hain par log unhe search karte hain.
const SHORTCUTS = [
  { key: 'blood', screen: 'BloodHome', title: 'Blood Donation', sub: 'Donors dhundho, blood request karo',
    words: ['blood', 'khoon', 'khun', 'rakt', 'donor', 'खून', 'रक्त', 'ब्लड'] },
  { key: 'ambulance', screen: 'AmbulanceHome', title: 'Ambulance', sub: 'Emergency ambulance bulao',
    words: ['ambulance', 'emergency', 'hospital', 'एम्बुलेंस', 'एंबुलेंस'] },
  { key: 'auto', screen: 'AutoHome', title: 'Auto Booking', sub: 'Auto / rickshaw book karo',
    words: ['auto', 'rickshaw', 'riksha', 'ride', 'ऑटो', 'रिक्शा'] },
  { key: 'complaint', screen: 'ComplaintHome', title: 'Complaint', sub: 'Shikayat darj karo, status dekho',
    words: ['complaint', 'shikayat', 'shikaayat', 'problem', 'शिकायत'] },
  { key: 'pass', screen: 'PassHome', title: 'Digital Pass', sub: 'Pass apply karo, apne pass dekho',
    words: ['pass', 'bus', 'card', 'पास'] },
  { key: 'donation', screen: 'DonationHome', title: 'Donation', sub: 'Daan karo, history dekho',
    words: ['donation', 'donate', 'daan', 'dan', 'दान', 'चंदा'] },
  { key: 'career', screen: 'CareerHome', title: 'Career / Jobs', sub: 'Naukri ke liye apply karo',
    words: ['career', 'job', 'jobs', 'naukri', 'vacancy', 'bharti', 'नौकरी', 'भर्ती'] },
  { key: 'gallery', screen: 'Gallery', title: 'Gallery', sub: 'Photos aur videos',
    words: ['gallery', 'photo', 'photos', 'video', 'videos', 'फोटो', 'वीडियो'] },
  { key: 'membership', screen: 'MembershipHome', title: 'Membership', sub: 'Sadasyata ki jaankari',
    words: ['membership', 'member', 'sadasya', 'सदस्य', 'सदस्यता'] },
  { key: 'services', screen: 'MyApplications', title: 'My Applications', sub: 'Apni applications ka status',
    words: ['application', 'applications', 'status', 'aavedan', 'आवेदन'] },
];

const norm = (v) => String(v ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
const tokensOf = (q) => norm(q).split(' ').filter(Boolean);

export default function ServicesScreen({ navigation, route }) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState(null); // category id (null = All)
  const inputRef = useRef(null);

  const svc = useApi(() => listAllServices(), []);
  const cats = useApi(() => serviceApi.listCategories(), []);

  // Home ke search box se aaye → keyboard turant kholo.
  const focusTs = route?.params?.ts;
  useEffect(() => {
    if (!route?.params?.focusSearch) return undefined;
    if (typeof route.params.q === 'string') setSearch(route.params.q);
    const t = setTimeout(() => inputRef.current?.focus(), 350); // screen transition ke baad
    return () => clearTimeout(t);
  }, [focusTs]); // eslint-disable-line react-hooks/exhaustive-deps

  const catList = useMemo(() => sortCategories(cats.data?.items || []), [cats.data]);
  const catIcon = useMemo(() => {
    const m = {}; (cats.data?.items || []).forEach((c) => { m[c.id] = c.icon; }); return m;
  }, [cats.data]);
  const catName = useMemo(() => {
    const m = {}; (cats.data?.items || []).forEach((c) => { m[c.id] = c.name; }); return m;
  }, [cats.data]);

  const chips = useMemo(() => [{ id: null, name: 'All', icon: '🗂️' }, ...catList], [catList]);
  const tokens = useMemo(() => tokensOf(search), [search]);

  const filtered = useMemo(() => {
    const all = (svc.data?.items || []).filter((s) => s.is_active !== false);
    const inCat = all.filter((s) => activeCat == null || String(s.category) === String(activeCat));
    if (!tokens.length) return inCat;

    const scored = [];
    inCat.forEach((s) => {
      const name = norm(`${s.name} ${s.name_hi || ''}`);
      const hay = norm(`${name} ${s.description || ''} ${catName[s.category] || ''}`);
      if (!tokens.every((t) => hay.includes(t))) return;
      // Naam se shuru → sabse upar, naam me → uske baad, sirf description me → neeche.
      const q = tokens.join(' ');
      const score = name.startsWith(q) ? 0 : name.includes(q) ? 1 : tokens.every((t) => name.includes(t)) ? 2 : 3;
      scored.push({ s, score });
    });
    scored.sort((a, b) => a.score - b.score || String(a.s.name).localeCompare(String(b.s.name)));
    return scored.map((x) => x.s);
  }, [svc.data, activeCat, tokens, catName]);

  const shortcuts = useMemo(() => {
    if (!tokens.length) return [];
    return SHORTCUTS.filter((sc) => tokens.some((t) =>
      sc.words.some((w) => w.startsWith(t) || (t.length >= 3 && w.includes(t)))
      || norm(sc.title).includes(t)));
  }, [tokens]);

  const activeLabel = tokens.length
    ? `Results for “${search.trim()}”`
    : activeCat == null ? 'All services' : (catName[activeCat] || 'Services');

  const openShortcut = (sc) => {
    Keyboard.dismiss();
    navigation.navigate(sc.screen);
  };

  const listHeader = (
    <View>
      {shortcuts.length ? (
        <View style={styles.shortcutWrap}>
          <Text style={styles.shortcutHead}>Sections</Text>
          {shortcuts.map((sc) => {
            const th = SECTION_THEMES[sc.key];
            return (
              <Pressable
                key={sc.key}
                onPress={() => openShortcut(sc)}
                style={({ pressed }) => [styles.shortcut, { borderLeftColor: th.tint }, pressed && { opacity: 0.8 }]}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: th.tint }]}>
                  <Ionicons name={th.icon} size={18} color="#fff" />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.shortcutTitle}>{sc.title}</Text>
                  <Text style={styles.shortcutSub}>{sc.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={th.tint} />
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={styles.countRow}>
        <Text style={styles.countTitle} numberOfLines={1}>{activeLabel}</Text>
        <Text style={styles.countBadge}>{filtered.length}</Text>
      </View>
    </View>
  );

  return (
    <Screen edges={['bottom']}>
      <Header
        title="Services"
        right={
          <Pressable onPress={() => navigation.navigate('MyApplications')} hitSlop={10}>
            <Ionicons name="document-text-outline" size={22} color="#fff" />
          </Pressable>
        }
      />

      {/* Fixed search bar — list ke bahar, isliye type karte waqt focus nahi jaata */}
      <View style={styles.topBar}>
        <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            ref={inputRef}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
            placeholder="Search: kachra, blood, pass, naukri…"
            placeholderTextColor={colors.textFaint}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="never"
          />
          {search ? (
            <Pressable onPress={() => { setSearch(''); inputRef.current?.focus(); }} hitSlop={8}
                       accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.textFaint} />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          data={chips}
          keyExtractor={(c) => String(c.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => {
            const active = activeCat === item.id;
            return (
              <Pressable onPress={() => setActiveCat(item.id)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item.icon ? `${item.icon} ` : ''}{item.name}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {svc.loading && !svc.data ? (
        <Loader message="Loading services…" />
      ) : svc.error ? (
        <ErrorView message={svc.error} onRetry={svc.refetch} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => String(s.id)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={listHeader}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              categoryIcon={catIcon[item.category]}
              categoryName={catName[item.category]}
              onPress={() => navigation.navigate('ServiceDetails', { service: item, categoryIcon: catIcon[item.category] })}
            />
          )}
          ListEmptyComponent={
            shortcuts.length ? null : (
              <EmptyState
                icon="search-outline"
                title="No services found"
                message={tokens.length ? 'Koi aur shabd try kariye, ya category “All” chuniye.' : 'Try a different category.'}
              />
            )
          }
          refreshing={svc.loading}
          onRefresh={() => { svc.refetch(); cats.refetch(); }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, flexGrow: 1 },
  search: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.pill, paddingHorizontal: spacing.lg, minHeight: 50,
    ...shadow.card,
  },
  searchInput: { flex: 1, marginHorizontal: spacing.sm, fontSize: typography.body, color: colors.text, paddingVertical: 10 },
  chipRow: { paddingVertical: spacing.md },
  chip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary, ...shadow.card },
  chipText: { fontSize: typography.small, color: colors.textMuted },
  chipTextActive: { color: '#fff', fontWeight: typography.semibold },

  shortcutWrap: { marginBottom: spacing.md },
  shortcutHead: { fontSize: typography.small, fontWeight: typography.semibold, color: colors.textMuted, marginBottom: spacing.sm },
  shortcut: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    borderLeftWidth: 4, ...shadow.card,
  },
  shortcutIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  shortcutTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  shortcutSub: { fontSize: typography.tiny, color: colors.textMuted, marginTop: 1 },

  countRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  countTitle: { fontSize: typography.h3, fontWeight: typography.semibold, color: colors.text, flexShrink: 1 },
  countBadge: {
    marginLeft: spacing.sm, fontSize: typography.tiny, fontWeight: typography.bold, color: colors.primaryDark,
    backgroundColor: colors.primaryLight, borderRadius: radius.pill, overflow: 'hidden',
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
});
