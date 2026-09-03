import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Loader, ErrorView, EmptyState, Card } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import * as notificationApi from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../utils/format';
import { friendlyError } from '../../utils/apiHelpers';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { data, loading, error, refetch, setData } = useApi(() => notificationApi.myNotifications(user?.id), [user?.id]);
  const [marking, setMarking] = useState(false);

  const items = data?.items || [];
  const unread = items.filter((n) => !n.is_read).length;

  const markOne = async (n) => {
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

  return (
    <Screen edges={['top', 'bottom']}>
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
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={[styles.card, !item.is_read && styles.unread]} onPress={() => markOne(item)}>
              <View style={styles.row}>
                <View style={[styles.dot, { backgroundColor: item.is_read ? colors.border : colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, !item.is_read && styles.titleUnread]}>{item.title}</Text>
                  {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
                  <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={<EmptyState icon="notifications-outline" title="No notifications" message="You're all caught up." />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  markAll: { color: colors.primary, fontWeight: typography.semibold, fontSize: typography.small },
  list: { padding: spacing.lg, flexGrow: 1 },
  card: { marginBottom: spacing.md },
  unread: { backgroundColor: colors.primarySoft },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: spacing.md },
  title: { fontSize: typography.body, color: colors.text, fontWeight: typography.medium },
  titleUnread: { fontWeight: typography.bold },
  message: { fontSize: typography.small, color: colors.textMuted, marginTop: 2, lineHeight: 19 },
  time: { fontSize: typography.tiny, color: colors.textFaint, marginTop: spacing.sm },
});
