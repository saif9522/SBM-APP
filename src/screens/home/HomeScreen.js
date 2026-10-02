import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Image, FlatList, ActivityIndicator, Dimensions, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius, shadow } from '../../constants/theme';
import { Card, BannerSlider, PaymentModal } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { initials, mediaUrl } from '../../utils/format';
import { BANNERS } from '../../constants/assets';
import { paymentUrl } from '../../constants/config';
import useApi from '../../hooks/useApi';
import serviceApi, { listAllServices, sortServicesGarbageFirst } from '../../api/serviceApi';
import galleryApi from '../../api/galleryApi';
import { SECTION_THEMES } from '../../constants/sectionThemes';
import { openInTab } from '../../navigation/navHelpers';
import { useFocusEffect } from '@react-navigation/native';
import { paymentStatus } from '../../api/paymentApi';

// Har tile ka rang wahi hai jo uske andar ke screens ka hai
// (constants/sectionThemes.js) — Blood dabao, agla screen bhi laal.
const QUICK = [
  { key: 'blood', label: 'Blood', icon: 'water', screen: 'BloodHome' },
  { key: 'complaint', label: 'Complaint', icon: 'megaphone', screen: 'ComplaintHome' },
  { key: 'donation', label: 'Donation', icon: 'heart', screen: 'DonationHome' },
  { key: 'pass', label: 'Pass', icon: 'card', screen: 'PassHome' },
  { key: 'services', label: 'Services', icon: 'grid', screen: 'ServicesHome' },
].map((q) => ({ ...q, theme: SECTION_THEMES[q.key] }));

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const name = user?.name || 'Guest';
  const [headerH, setHeaderH] = useState(0);
  const [regPayOpen, setRegPayOpen] = useState(false);
  const SCREEN_W = Dimensions.get('window').width;
  const SCREEN_H = Dimensions.get('window').height;

  // Registration fee pending? (unpaid citizens admin me hidden rehte hain)
  const feePaid = ['paid', 'waived'].includes(user?.payment_status);
  const showFeeBanner = !!user?.payment_status && !feePaid;

  // PaymentModal already asked the server (which asked Razorpay). Always
  // refresh the user afterwards so the banner reflects the server's truth.
  const onRegPayClosed = async (paidByServer) => {
    setRegPayOpen(false);
    const fresh = await refreshUser(); // works on old + new backend
    if (paidByServer || ['paid', 'waived'].includes(fresh?.payment_status)) {
      Alert.alert('Payment received ✅', 'Registration complete — your account is active.');
    }
  };

  // Paid in GPay / in the browser / earlier on another phone, but the app
  // still shows the banner? Every time Home opens with the banner, quietly
  // ask the server — it checks Razorpay and records a payment it missed.
  const [verifying, setVerifying] = useState(false);
  useFocusEffect(useCallback(() => {
    if (!showFeeBanner || !user?.id) return undefined;
    let alive = true;
    setVerifying(true);
    // New backend: status check reconciles with Razorpay. Old backend: that
    // endpoint is absent, so we just re-read the user — still catches a
    // payment completed in the browser.
    paymentStatus('registration', user.id)
      .catch(() => null)
      .then(() => (alive ? refreshUser() : null))
      .finally(() => { if (alive) setVerifying(false); });
    return () => { alive = false; };
  }, [showFeeBanner, user?.id, refreshUser]));

  const popular = useApi(() => listAllServices(), []);
  const cats = useApi(() => serviceApi.listCategories(), []);
  const photos = useApi(() => galleryApi.photos(), []);

  // Category id -> name map, aur Popular ko Garbage-first sort karo.
  const catNameById = {};
  (cats.data?.items || []).forEach((c) => { catNameById[c.id] = c.name; });
  const popularItems = sortServicesGarbageFirst(popular.data?.items || [], catNameById).slice(0, 10);

  // openInTab: target stack ko saaf [screen] banata hai, taaki back seedha
  // Home par aaye (pehle purane bache screens par jaata tha).
  const goQuick = (item) => openInTab(navigation, 'Services', item.screen, { quick: item.key });
  const openSearch = () => openInTab(navigation, 'Services', 'ServicesHome', { focusSearch: true, showBack: true, ts: Date.now() });

  // ── Home banner slider ── aapke hero-banner images, poore (na crop, na white).
  const banners = BANNERS.map((img, i) => {
    const src = Image.resolveAssetSource(img);
    const aspect = src && src.height ? src.width / src.height : 2.6;
    return {
      key: `banner${i}`,
      image: img,
      aspect,
      resizeMode: 'cover',
      onPress: () => openInTab(navigation, 'Services', 'ServicesHome'),
    };
  });

  return (
    <View style={styles.root}>
      <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="homeBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F4FAF3" />
            <Stop offset="1" stopColor="#E3F0E1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#homeBg)" />
      </Svg>
      <View style={styles.headerShadow}>
        <View
          style={[styles.header, { paddingTop: insets.top + spacing.md }]}
          onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
        >
          {/* green gradient background */}
          {headerH > 0 ? (
            <Svg width={SCREEN_W} height={headerH} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="hgrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#1BA80C" />
                  <Stop offset="0.6" stopColor="#138808" />
                  <Stop offset="1" stopColor="#0B5E04" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#hgrad)" />
              <Circle cx={SCREEN_W - 24} cy={30} r={80} fill="#FFFFFF" opacity={0.07} />
              <Circle cx={30} cy={headerH - 10} r={70} fill="#FFFFFF" opacity={0.06} />
            </Svg>
          ) : null}

          <View style={styles.headerRow}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials(name) || 'G'}</Text></View>
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text style={styles.hello}>Namaste 👋</Text>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
              </View>
            </View>
            <Pressable hitSlop={10} style={styles.bell} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </Pressable>
          </View>

          <Text style={styles.prompt}>How can we help you today?</Text>
          <Pressable
            style={styles.search}
            onPress={openSearch}
            accessibilityRole="search"
            accessibilityLabel="Search services"
          >
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <Text style={styles.searchPlaceholder}>Search services, blood, pass…</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.textFaint} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {showFeeBanner ? (
          <Pressable style={styles.feeBanner} onPress={() => setRegPayOpen(true)}>
            <View style={styles.feeIcon}>
              <Ionicons name="alert-circle" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.feeTitle}>Complete your registration</Text>
              <Text style={styles.feeSub}>
                {verifying
                  ? 'Checking if your payment has arrived…'
                  : 'Pay the one-time registration fee to activate your account. Already paid? It updates automatically.'}
              </Text>
            </View>
            <View style={styles.feePay}>
              {verifying
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.feePayText}>Pay</Text>}
            </View>
          </Pressable>
        ) : null}

        {/* Home banner / slider — colored slides (no images) */}
        <View style={styles.bannerWrap}>
          <BannerSlider slides={banners} interval={3800} />
        </View>

        <SectionHeader title="Quick Services" />
        <View style={styles.grid}>
          {QUICK.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [styles.quickItem, pressed && { opacity: 0.75 }]}
              onPress={() => goQuick(item)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <View style={[styles.quickIcon, {
                backgroundColor: item.theme.chip,
                borderColor: `${item.theme.tint}33`,
              }]}>
                <View style={[styles.quickBadge, { backgroundColor: item.theme.tint }]}>
                  <Ionicons name={item.icon} size={20} color="#fff" />
                </View>
              </View>
              <Text style={[styles.quickLabel, { color: item.theme.grad[2] }]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.emergency} onPress={() => Linking.openURL('tel:+919431252735')}>
          <View style={styles.emergencyBtn}>
            <Ionicons name="call" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.emergencyTitle}>Emergency Helpline · 24×7</Text>
            <Text style={styles.emergencyNumber}>+91 94312 52735</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </Pressable>

        {/* Popular services — backend se, image ke saath */}
        <SectionHeader title="Popular Services" actionLabel="View all" onAction={() => openInTab(navigation, 'Services', 'ServicesHome', { showBack: true })} />
        {popular.loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : popularItems.length ? (
          <FlatList
            data={popularItems}
            keyExtractor={(s) => String(s.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const img = mediaUrl(item.image);
              return (
                <Pressable
                  style={styles.popCard}
                  onPress={() => openInTab(navigation, 'Services', 'ServiceDetails', { service: item })}
                >
                  <View style={styles.popThumb}>
                    {img ? (
                      <Image source={{ uri: img }} style={styles.popImg} resizeMode="cover" />
                    ) : (
                      <Ionicons name="construct-outline" size={26} color={colors.primary} />
                    )}
                  </View>
                  <View style={styles.popBody}>
                    <Text style={styles.popName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.popPrice}>₹{Number(item.price || 0).toLocaleString('en-IN')}</Text>
                  </View>
                </Pressable>
              );
            }}
          />
        ) : (
          <Text style={styles.placeholderText}>No services to show yet.</Text>
        )}

        {/* Gallery preview */}
        <SectionHeader title="Gallery" actionLabel="View all" onAction={() => openInTab(navigation, 'Services', 'Gallery')} />
        {photos.loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : (photos.data?.items || []).length ? (
          <FlatList
            data={photos.data.items.filter((g) => g.media_type !== 'video' && g.image).slice(0, 8)}
            keyExtractor={(g) => String(g.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const uri = mediaUrl(item.image || item.file);
              return uri ? (
                <Pressable onPress={() => openInTab(navigation, 'Services', 'PhotoDetails', { item })}>
                  <Image source={{ uri }} style={styles.galleryThumb} />
                </Pressable>
              ) : null;
            }}
          />
        ) : (
          <Text style={styles.placeholderText}>No photos yet.</Text>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      <PaymentModal
        visible={regPayOpen}
        kind="registration"
        refId={user?.id}
        url={user?.id ? paymentUrl('registration', user.id) : null}
        onClose={onRegPayClosed}
      />
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
  headerShadow: {
    borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, ...shadow.raised,
    backgroundColor: colors.primary,
  },
  header: {
    paddingHorizontal: spacing.lg, paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, overflow: 'hidden',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.body },
  hello: { fontSize: typography.small, color: 'rgba(255,255,255,0.85)' },
  name: { fontSize: typography.h3, fontWeight: typography.semibold, color: '#fff' },
  bell: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  prompt: { fontSize: typography.body, color: 'rgba(255,255,255,0.92)', marginTop: spacing.lg, fontWeight: typography.medium },
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, paddingHorizontal: spacing.lg, marginTop: spacing.md, minHeight: 48, ...shadow.card },
  searchPlaceholder: { flex: 1, marginLeft: spacing.sm, fontSize: typography.body, color: colors.textMuted },

  body: { padding: spacing.lg },
  bannerWrap: { marginTop: spacing.sm, marginBottom: spacing.sm },
  feeBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentLight,
    borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.accent, ...shadow.card,
  },
  feeIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  feeTitle: { fontSize: typography.small, fontWeight: typography.bold, color: colors.text },
  feeSub: { fontSize: typography.tiny, color: colors.textMuted, marginTop: 2, lineHeight: 16 },
  feePay: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 8 },
  feePayText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.small },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.h3, fontWeight: typography.semibold, color: colors.text },
  sectionAction: { fontSize: typography.small, color: colors.primary, fontWeight: typography.semibold },

  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  quickItem: { width: '19%', alignItems: 'center' },
  quickIcon: { width: 58, height: 58, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs, borderWidth: 1 },
  quickBadge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  quickLabel: { fontSize: typography.tiny, fontWeight: typography.semibold, textAlign: 'center' },

  emergency: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentLight, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg, ...shadow.card },
  emergencyTitle: { fontSize: typography.small, fontWeight: typography.semibold, color: colors.text },
  emergencyNumber: { fontSize: typography.body, fontWeight: typography.bold, color: colors.accent, marginTop: 1 },
  emergencyBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },

  popCard: { width: 160, backgroundColor: colors.surface, borderRadius: radius.lg, marginRight: spacing.md, overflow: 'hidden', ...shadow.card },
  popThumb: { height: 92, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  popImg: { width: '100%', height: '100%' },
  popBody: { padding: spacing.md },
  popName: { fontSize: typography.small, fontWeight: typography.semibold, color: colors.text, minHeight: 36 },
  popPrice: { fontSize: typography.body, fontWeight: typography.bold, color: colors.primary, marginTop: spacing.xs },

  notice: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  noticeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6, marginRight: spacing.md },
  noticeTitle: { fontSize: typography.small, color: colors.text, fontWeight: typography.medium, lineHeight: 19 },
  noticeDate: { fontSize: typography.tiny, color: colors.textFaint, marginTop: 2 },

  galleryThumb: { width: 110, height: 84, borderRadius: radius.md, marginRight: spacing.md, backgroundColor: colors.primarySoft },

  placeholderText: { color: colors.textFaint, fontSize: typography.small, marginVertical: spacing.md },
});
