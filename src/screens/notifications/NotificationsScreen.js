import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Loader, ErrorView, EmptyState, Card } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import * as notificationApi from '../../api/notificationApi';
import newsApi from '../../api/newsApi';
import { useAuth } from '../../context/AuthContext';
import { timeAgo, formatDate } from '../../utils/format';
import { friendlyError } from '../../utils/apiHelpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ease = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

// Notice ka title / body / date alag-alag backend field names me aa sakta hai.
const noticeTitle = (n) => n?.title || n?.heading || n?.headline || n?.subject || 'Notice';
const noticeBody = (n) =>
  n?.description || n?.content || n?.details || n?.message || n?.body || n?.text || '';
const noticeDate = (n) => n?.created_at || n?.published_at || n?.date || n?.updated_at || null;

export default function NotificationsScreen() {
  const { user } = useAuth();

  // Personal notifications — sirf logged-in user ke (api layer filter karti hai).
  const { data, loading, error, refetch, setData } = useApi(
    () => notificationApi.myNotifications(user),
    [user?.id, user?.phone]
  );
  // Notices — ye public hain (sabke liye same), isliye bilkul alag section me.
  const notices = useApi(() => newsApi.activeNews(), []);

  const [marking, setMarking] = useState(false);
  const [noticesOpen, setNoticesOpen] = useState(true);
  const [openNotice, setOpenNotice] = useState(null);     // ek waqt me ek notice khula
  const [openNotifs, setOpenNotifs] = useState({});       // id -> bool

  const items = data?.items || [];
  const noticeItems = notices.data?.items || [];
  const unread = items.filter((n) => !n.is_read).length;

  const toggleNotice = useCallback((id) => {
    ease();
    setOpenNotice((cur) => (cur === id ? null : id));
  }, []);

  const toggleNotif = useCallback((id) => {
    ease();
    setOpenNotifs((cur) => ({ ...cur, [id]: !cur[id] }));
  }, []);

  const markOne = async (n) => {
    toggleNotif(n.id);
    if (n.is_read) return;
    setData({ ...data, items: items.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)) });
    try { await notificationApi.markRead(n.id); } catch { refetch(); }
  };

  const markAll = async () => {
    if (!unread) return;
    setMarking(true);
    try {
      await notificationApi.markAllRead(items);
      setData({ ...data, items: items.map((x) => ({ ...x, is_read: true })) });
    } catch (err) {
      Alert.alert('Could not update', friendlyError(err));
    } finally { setMarking(false); }
  };

  // ── Section 1: Notices (public) — poora section aur har notice dropdown ──
  const NoticesSection = () => (
    <View style={styles.section}>
      <Pressable style={styles.sectionHead} onPress={() => { ease(); setNoticesOpen((o) => !o); }}>
        <Ionicons name="megaphone-outline" size={16} color={colors.primary} />
        <Text style={styles.sectionTitle}>Latest Notices / सूचना</Text>
        {noticeItems.length ? (
          <View style={styles.countPill}><Text style={styles.countText}>{noticeItems.length}</Text></View>
        ) : null}
        <View style={{ flex: 1 }} />
        <Ionicons name={noticesOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>

      {noticesOpen ? (
        noticeItems.length ? (
          noticeItems.map((n) => {
            const open = openNotice === n.id;
            const body = noticeBody(n);
            const date = noticeDate(n);
            return (
              <Card key={`notice-${n.id}`} style={styles.noticeCard} padded={false}>
                <Pressable style={styles.noticeHead} onPress={() => toggleNotice(n.id)}>
                  <View style={styles.noticeDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noticeTitle} numberOfLines={open ? undefined : 2}>
                      {noticeTitle(n)}
                    </Text>
                    {date ? <Text style={styles.noticeDate}>{formatDate(date)}</Text> : null}
                  </View>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textFaint}
                    style={{ marginLeft: spacing.sm }}
                  />
                </Pressable>
                {open ? (
                  <View style={styles.noticeBody}>
                    <Text style={styles.noticeText}>
                      {body || 'No further details were added to this notice.'}
                    </Text>
                  </View>
                ) : null}
              </Card>
            );
          })
        ) : (
          <Text style={styles.sectionEmpty}>No active notices right now.</Text>
        )
      ) : null}
    </View>
  );

  // ── Section 2 heading: personal notifications ──
  const ListHeader = () => (
    <View>
      <NoticesSection />
      <View style={styles.sectionHead}>
        <Ionicons name="notifications-outline" size={16} color={colors.primary} />
        <Text style={styles.sectionTitle}>My Notifications</Text>
        {unread ? (
          <View style={styles.countPill}><Text style={styles.countText}>{unread} new</Text></View>
        ) : null}
      </View>
      {!items.length ? (
        <Text style={styles.sectionEmpty}>You have no personal notifications yet.</Text>
      ) : null}
    </View>
  );

  return (
    <Screen edges={['bottom']}>
      <Header
        title="Notifications"
        right={unread ? (
          <Pressable onPress={markAll} hitSlop={8} disabled={marking}>
            <Text style={styles.markAll}>Read all</Text>
          </Pressable>
        ) : null}
      />
      {loading && !data ? <Loader message="Loading…" /> : error ? <ErrorView message={error} onRetry={refetch} /> : (
        <FlatList
          data={items}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={() => { refetch(); notices.refetch(); }}
          ListHeaderComponent={ListHeader}
          renderItem={({ item }) => {
            const open = !!openNotifs[item.id];
            return (
              <Card style={[styles.card, !item.is_read && styles.unread]} padded={false}>
                <Pressable style={styles.notifHead} onPress={() => markOne(item)}>
                  <View style={[styles.dot, { backgroundColor: item.is_read ? colors.border : colors.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.title, !item.is_read && styles.titleUnread]} numberOfLines={open ? undefined : 2}>
                      {item.title}
                    </Text>
                    {item.message ? (
                      <Text style={styles.message} numberOfLines={open ? undefined : 2}>{item.message}</Text>
                    ) : null}
                    <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
                  </View>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textFaint}
                    style={{ marginLeft: spacing.sm }}
                  />
                </Pressable>
              </Card>
            );
          }}
          ListEmptyComponent={
            noticeItems.length ? null : (
              <EmptyState icon="notifications-outline" title="No notifications" message="You're all caught up." />
            )
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  markAll: { color: '#fff', fontWeight: typography.semibold, fontSize: typography.small },
  list: { padding: spacing.lg, flexGrow: 1 },

  section: { marginBottom: spacing.lg },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.semibold,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  sectionEmpty: {
    fontSize: typography.small,
    color: colors.textFaint,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  countPill: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  countText: { fontSize: typography.tiny, color: colors.primaryDark, fontWeight: typography.semibold },

  noticeCard: { marginBottom: spacing.md, overflow: 'hidden' },
  noticeHead: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.lg },
  noticeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6, marginRight: spacing.md },
  noticeTitle: { fontSize: typography.small, color: colors.text, fontWeight: typography.medium, lineHeight: 19 },
  noticeDate: { fontSize: typography.tiny, color: colors.textFaint, marginTop: 2 },
  noticeBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
  },
  noticeText: { fontSize: typography.small, color: colors.textMuted, lineHeight: 21 },

  card: { marginBottom: spacing.md, overflow: 'hidden' },
  unread: { backgroundColor: colors.primarySoft },
  notifHead: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: spacing.md },
  title: { fontSize: typography.body, color: colors.text, fontWeight: typography.medium },
  titleUnread: { fontWeight: typography.bold },
  message: { fontSize: typography.small, color: colors.textMuted, marginTop: 2, lineHeight: 19 },
  time: { fontSize: typography.tiny, color: colors.textFaint, marginTop: spacing.sm },
});
