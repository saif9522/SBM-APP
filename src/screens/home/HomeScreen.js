import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Image, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius, shadow } from '../../constants/theme';
import { Card } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { initials, mediaUrl, formatDate } from '../../utils/format';
import useApi from '../../hooks/useApi';
import serviceApi from '../../api/serviceApi';
import newsApi from '../../api/newsApi';
import galleryApi from '../../api/galleryApi';

const QUICK = [
  { key: 'auto', label: 'Auto', icon: 'car-outline', tint: colors.primary },
  { key: 'ambulance', label: 'Ambulance', icon: 'medkit-outline', tint: colors.accent },
  { key: 'blood', label: 'Blood', icon: 'water-outline', tint: colors.danger },
  { key: 'complaint', label: 'Complaint', icon: 'megaphone-outline', tint: colors.processing },
  { key: 'donation', label: 'Donation', icon: 'heart-outline', tint: colors.primary },
  { key: 'pass', label: 'Pass', icon: 'card-outline', tint: colors.info },
  { key: 'membership', label: 'Membership', icon: 'people-outline', tint: colors.primaryDark },
  { key: 'services', label: 'Services', icon: 'grid-outline', tint: colors.textMuted },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const name = user?.name || 'Guest';

  const popular = useApi(() => serviceApi.listServices({}), []);
  const notices = useApi(() => newsApi.activeNews(), []);
  const photos = useApi(() => galleryApi.photos(), []);

  const goServices = (quick) => {
    const map = { auto: 'AutoHome', ambulance: 'AmbulanceHome', blood: 'BloodHome', complaint: 'ComplaintHome', donation: 'DonationHome', pass: 'PassHome', membership: 'MembershipHome', services: 'ServicesHome' };
    const screen = map[quick] || 'ServicesHome';
    navigation.navigate('Services', { screen, params: { quick } });
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerRow}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials(name) || 'G'}</Text></View>
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={styles.hello}>Namaste 👋</Text>
              <Text style={styles.name} numberOfLines={1}>{name}</Text>
            </View>
          </View>
          <Pressable hitSlop={10} style={styles.bell} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </Pressable>
        </View>

        <Text style={styles.prompt}>How can we help you today?</Text>
        <Pressable style={styles.search} onPress={() => navigation.navigate('Services', { screen: 'ServicesHome' })}>
          <Ionicons name="search-outline" size={18} color={colors.textFaint} />
          <Text style={styles.searchPlaceholder}>Search services…</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Quick Services" />
        <View style={styles.grid}>
          {QUICK.map((item) => (
            <Pressable key={item.key} style={styles.quickItem} onPress={() => goServices(item.key)}>
              <View style={[styles.quickIcon, { backgroundColor: `${item.tint}14` }]}>
                <Ionicons name={item.icon} size={24} color={item.tint} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Card style={styles.emergency} padded>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>Emergency Services</Text>
            <Text style={styles.emergencySub}>Ambulance & urgent blood help, 24×7</Text>
          </View>
          <Pressable style={styles.emergencyBtn} onPress={() => goServices('ambulance')}>
            <Ionicons name="call" size={18} color="#fff" />
          </Pressable>
        </Card>

        {/* Popular services */}
        <SectionHeader title="Popular Services" actionLabel="View all" onAction={() => navigation.navigate('Services')} />
        {popular.loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : (popular.data?.items || []).length ? (
          <FlatList
            data={popular.data.items.slice(0, 6)}
            keyExtractor={(s) => String(s.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={styles.popCard}
                onPress={() => navigation.navigate('Services', { screen: 'ServiceDetails', params: { service: item } })}
              >
                <Text style={styles.popName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.popPrice}>₹{Number(item.price).toLocaleString('en-IN')}</Text>
              </Pressable>
            )}
          />
        ) : (
          <Text style={styles.placeholderText}>No services to show yet.</Text>
        )}

        {/* Latest notices */}
        <SectionHeader title="Latest Notices" actionLabel="View all" onAction={() => navigation.navigate('Notifications')} />
        {notices.loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : (notices.data?.items || []).length ? (
          (notices.data.items.slice(0, 3)).map((n) => (
            <Card key={n.id} style={styles.notice}>
              <View style={styles.noticeDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle} numberOfLines={2}>{n.title || n.heading || 'Notice'}</Text>
                {n.created_at ? <Text style={styles.noticeDate}>{formatDate(n.created_at)}</Text> : null}
              </View>
            </Card>
          ))
        ) : (
          <Text style={styles.placeholderText}>No notices right now.</Text>
        )}

        {/* Gallery preview */}
        <SectionHeader title="Gallery" actionLabel="View all" onAction={() => navigation.navigate('Services', { screen: 'Gallery' })} />
        {photos.loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : (photos.data?.items || []).length ? (
          <FlatList
            data={photos.data.items.slice(0, 8)}
            keyExtractor={(g) => String(g.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const uri = mediaUrl(item.image || item.file);
              return uri ? <Image source={{ uri }} style={styles.galleryThumb} /> : null;
            }}
          />
        ) : (
          <Text style={styles.placeholderText}>No photos yet.</Text>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}><Text style={styles.sectionAction}>{actionLabel}</Text></Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, ...shadow.card,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.body },
  hello: { fontSize: typography.small, color: colors.textMuted },
  name: { fontSize: typography.h3, fontWeight: typography.semibold, color: colors.text },
  bell: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  prompt: { fontSize: typography.body, color: colors.textMuted, marginTop: spacing.lg },
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: spacing.lg, marginTop: spacing.md, minHeight: 46 },
  searchPlaceholder: { flex: 1, marginLeft: spacing.sm, fontSize: typography.body, color: colors.textFaint },

  body: { padding: spacing.lg },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.h3, fontWeight: typography.semibold, color: colors.text },
  sectionAction: { fontSize: typography.small, color: colors.primary, fontWeight: typography.semibold },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickItem: { width: '23%', alignItems: 'center', marginBottom: spacing.lg },
  quickIcon: { width: 56, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  quickLabel: { fontSize: typography.tiny, color: colors.textMuted, fontWeight: typography.medium },

  emergency: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentLight, marginTop: spacing.sm },
  emergencyTitle: { fontSize: typography.body, fontWeight: typography.bold, color: colors.text },
  emergencySub: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
  emergencyBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },

  popCard: { width: 150, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginRight: spacing.md, ...shadow.card },
  popName: { fontSize: typography.small, fontWeight: typography.semibold, color: colors.text, minHeight: 38 },
  popPrice: { fontSize: typography.body, fontWeight: typography.bold, color: colors.primary, marginTop: spacing.sm },

  notice: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  noticeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6, marginRight: spacing.md },
  noticeTitle: { fontSize: typography.small, color: colors.text, fontWeight: typography.medium, lineHeight: 19 },
  noticeDate: { fontSize: typography.tiny, color: colors.textFaint, marginTop: 2 },

  galleryThumb: { width: 110, height: 84, borderRadius: radius.md, marginRight: spacing.md, backgroundColor: colors.primarySoft },

  placeholderText: { color: colors.textFaint, fontSize: typography.small, marginVertical: spacing.md },
});
