import React, { useState } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Loader, ErrorView, EmptyState } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import galleryApi from '../../api/galleryApi';
import { mediaUrl } from '../../utils/format';

const { width } = Dimensions.get('window');
const COL = 2;
const GAP = spacing.md;
const TILE = (width - spacing.lg * 2 - GAP) / COL;

export default function GalleryScreen({ navigation }) {
  const [tab, setTab] = useState('image');
  const photos = useApi(() => galleryApi.photos(), []);
  const videos = useApi(() => galleryApi.videos(), []);
  const active = tab === 'image' ? photos : videos;

  return (
    <Screen edges={['top']}>
      <Header title="Gallery" onBack={navigation?.canGoBack?.() ? () => navigation.goBack() : undefined} />
      <View style={styles.tabs}>
        {[['image', 'Photos'], ['video', 'Videos']].map(([key, label]) => (
          <Pressable key={key} onPress={() => setTab(key)} style={[styles.tab, tab === key && styles.tabActive]}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {active.loading && !active.data ? (
        <Loader message="Loading gallery…" />
      ) : active.error ? (
        <ErrorView message={active.error} onRetry={active.refetch} />
      ) : tab === 'image' ? (
        <FlatList
          data={photos.data?.items || []}
          keyExtractor={(g) => String(g.id)}
          numColumns={COL}
          columnWrapperStyle={{ gap: GAP }}
          contentContainerStyle={styles.grid}
          refreshing={photos.loading}
          onRefresh={photos.refetch}
          renderItem={({ item }) => {
            const uri = mediaUrl(item.image);
            return (
              <Pressable style={styles.tile} onPress={() => navigation.navigate('PhotoDetails', { item })}>
                {uri ? <Image source={{ uri }} style={styles.tileImg} /> : <View style={[styles.tileImg, styles.tilePlaceholder]}><Ionicons name="image-outline" size={28} color={colors.textFaint} /></View>}
              </Pressable>
            );
          }}
          ListEmptyComponent={<EmptyState icon="images-outline" title="No photos yet" message="Photos will appear here." />}
        />
      ) : (
        <FlatList
          data={videos.data?.items || []}
          keyExtractor={(g) => String(g.id)}
          contentContainerStyle={styles.list}
          refreshing={videos.loading}
          onRefresh={videos.refetch}
          renderItem={({ item }) => (
            <Pressable style={styles.videoRow} onPress={() => navigation.navigate('VideoPlayer', { item })}>
              <View style={styles.playIcon}><Ionicons name="play" size={20} color="#fff" /></View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.videoTitle} numberOfLines={1}>{item.title || 'Video'}</Text>
                {item.description ? <Text style={styles.videoDesc} numberOfLines={1}>{item.description}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Pressable>
          )}
          ListEmptyComponent={<EmptyState icon="videocam-outline" title="No videos yet" message="Videos will appear here." />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: spacing.lg, gap: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: typography.body, color: colors.textMuted, fontWeight: typography.medium },
  tabTextActive: { color: '#fff', fontWeight: typography.semibold },
  grid: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: GAP, flexGrow: 1 },
  tile: { width: TILE, height: TILE, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.primarySoft },
  tileImg: { width: '100%', height: '100%' },
  tilePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.lg, flexGrow: 1 },
  videoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  playIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  videoTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  videoDesc: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
});
