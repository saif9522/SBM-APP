import React, { useState } from 'react';
import {
  View, Text, FlatList, Image, Pressable, StyleSheet, Dimensions, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Loader, ErrorView, EmptyState } from '../../components';
import { colors, spacing, typography, radius, shadow } from '../../constants/theme';
import useSectionTheme from '../../hooks/useSectionTheme';
import usePaginated from '../../hooks/usePaginated';
import galleryApi, { isPhotoItem, isVideoItem } from '../../api/galleryApi';
import { mediaUrl, formatDate } from '../../utils/format';

const { width } = Dimensions.get('window');
const COL = 2;
const GAP = spacing.md;
const TILE = (width - spacing.lg * 2 - GAP) / COL;

/**
 * Gallery — kya theek kiya
 *  - Photos: pehle sirf pehli 20 aati thin. Ab scroll karte jao, saari aati hain.
 *  - Album: ek post me kai photos ho to tile par "+N" badge; kholne par saari swipe karke.
 *  - Videos: tab kholne par hi load (pehle dono saath load hote the), thumbnail
 *    ke saath, aur player ab app ke andar chalta hai.
 *  - Server `?media_type=` ignore kare tab bhi photo tab me video/video tab me
 *    photo nahi aayegi — client bhi check karta hai.
 */
export default function GalleryScreen({ navigation }) {
  const theme = useSectionTheme();
  const [tab, setTab] = useState('image');

  const photos = usePaginated((page) => galleryApi.photos({ page }), {
    filter: isPhotoItem,
    enabled: true,
  });
  const videos = usePaginated((page) => galleryApi.videos({ page }), {
    filter: isVideoItem,
    enabled: tab === 'video', // lazy
  });
  const active = tab === 'image' ? photos : videos;

  const footer = active.loadingMore ? (
    <ActivityIndicator color={theme.tint} style={{ marginVertical: spacing.lg }} />
  ) : !active.hasNext && active.items.length > COL * 3 ? (
    <Text style={styles.endText}>Bas itna hi — {active.items.length} {tab === 'image' ? 'photos' : 'videos'}</Text>
  ) : null;

  const renderPhoto = ({ item }) => {
    const uri = mediaUrl(item.image);
    const extra = Array.isArray(item.extras) ? item.extras.length : (item.extra_count || 0);
    return (
      <Pressable
        style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}
        onPress={() => navigation.navigate('PhotoDetails', { item })}
        accessibilityLabel={item.title || 'Photo'}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.tileImg} />
        ) : (
          <View style={[styles.tileImg, styles.tilePlaceholder, { backgroundColor: theme.chip }]}>
            <Ionicons name="image-outline" size={28} color={theme.tint} />
          </View>
        )}
        {extra > 0 ? (
          <View style={[styles.albumBadge, { backgroundColor: theme.tint }]}>
            <Ionicons name="albums" size={12} color="#fff" />
            <Text style={styles.albumText}>+{extra}</Text>
          </View>
        ) : null}
        {item.title ? (
          <View style={styles.caption}><Text style={styles.captionText} numberOfLines={1}>{item.title}</Text></View>
        ) : null}
      </Pressable>
    );
  };

  const renderVideo = ({ item }) => {
    const thumb = mediaUrl(item.image);
    return (
      <Pressable
        style={({ pressed }) => [styles.videoCard, pressed && { opacity: 0.9 }]}
        onPress={() => navigation.navigate('VideoPlayer', { item })}
        accessibilityLabel={`Play ${item.title || 'video'}`}
      >
        <View style={[styles.videoThumb, { backgroundColor: theme.grad[2] }]}>
          {thumb ? <Image source={{ uri: thumb }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
          <View style={styles.videoShade} />
          <View style={[styles.playBtn, { backgroundColor: theme.tint }]}>
            <Ionicons name="play" size={26} color="#fff" style={{ marginLeft: 3 }} />
          </View>
        </View>
        <View style={styles.videoMeta}>
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title || 'Video'}</Text>
          {item.description ? <Text style={styles.videoDesc} numberOfLines={2}>{item.description}</Text> : null}
          {item.created_at ? <Text style={styles.videoDate}>{formatDate(item.created_at)}</Text> : null}
        </View>
      </Pressable>
    );
  };

  return (
    <Screen edges={['bottom']}>
      <Header title="Gallery" />

      <View style={styles.tabs}>
        {[['image', 'Photos', 'images'], ['video', 'Videos', 'videocam']].map(([key, label, icon]) => {
          const on = tab === key;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={[styles.tab, on && { backgroundColor: theme.tint, borderColor: theme.tint }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              <Ionicons name={on ? icon : `${icon}-outline`} size={16} color={on ? '#fff' : colors.textMuted} />
              <Text style={[styles.tabText, on && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {active.loading && !active.items.length ? (
        <Loader message={tab === 'image' ? 'Loading photos…' : 'Loading videos…'} />
      ) : active.error && !active.items.length ? (
        <ErrorView message={active.error} onRetry={active.reload} />
      ) : tab === 'image' ? (
        <FlatList
          key="photos"
          data={photos.items}
          keyExtractor={(g) => `p${g.id}`}
          numColumns={COL}
          columnWrapperStyle={{ gap: GAP }}
          contentContainerStyle={styles.grid}
          renderItem={renderPhoto}
          onEndReached={photos.loadMore}
          onEndReachedThreshold={0.6}
          refreshing={photos.refreshing}
          onRefresh={photos.refresh}
          ListFooterComponent={footer}
          initialNumToRender={10}
          windowSize={7}
          removeClippedSubviews
          ListEmptyComponent={<EmptyState icon="images-outline" title="No photos yet" message="Photos will appear here." />}
        />
      ) : (
        <FlatList
          key="videos"
          data={videos.items}
          keyExtractor={(g) => `v${g.id}`}
          contentContainerStyle={styles.list}
          renderItem={renderVideo}
          onEndReached={videos.loadMore}
          onEndReachedThreshold={0.6}
          refreshing={videos.refreshing}
          onRefresh={videos.refresh}
          ListFooterComponent={footer}
          ListEmptyComponent={<EmptyState icon="videocam-outline" title="No videos yet" message="Videos will appear here." />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: spacing.lg, gap: spacing.md },
  tab: {
    flex: 1, flexDirection: 'row', gap: 6, paddingVertical: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  tabText: { fontSize: typography.body, color: colors.textMuted, fontWeight: typography.medium },
  tabTextActive: { color: '#fff', fontWeight: typography.semibold },

  grid: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: GAP, flexGrow: 1 },
  tile: { width: TILE, height: TILE, borderRadius: radius.md, overflow: 'hidden', backgroundColor: '#eee' },
  tileImg: { width: '100%', height: '100%' },
  tilePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  albumBadge: {
    position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill,
  },
  albumText: { color: '#fff', fontSize: typography.tiny, fontWeight: typography.bold },
  caption: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: 'rgba(0,0,0,0.42)' },
  captionText: { color: '#fff', fontSize: typography.tiny, fontWeight: typography.medium },

  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  videoCard: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.lg, overflow: 'hidden', ...shadow.card },
  videoThumb: { height: (width - spacing.lg * 2) * 0.5, alignItems: 'center', justifyContent: 'center' },
  videoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.22)' },
  playBtn: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)' },
  videoMeta: { padding: spacing.md },
  videoTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  videoDesc: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
  videoDate: { fontSize: typography.tiny, color: colors.textFaint, marginTop: spacing.xs },
  endText: { textAlign: 'center', color: colors.textFaint, fontSize: typography.tiny, marginVertical: spacing.lg },
});
