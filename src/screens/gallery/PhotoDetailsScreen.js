import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Image, FlatList, ScrollView, Pressable, StyleSheet, Dimensions, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import useSectionTheme from '../../hooks/useSectionTheme';
import { extrasFor } from '../../api/galleryApi';
import { mediaUrl, formatDate } from '../../utils/format';

const { width } = Dimensions.get('window');
const SLIDE_W = width;
const IMG_H = width; // square stage; images are letter-boxed (contain), never cropped

/**
 * Ek post ki SAARI photos — main image + album ki extra photos — swipe
 * karke. Pehle sirf main image dikhti thi; album ki baaki photos app me
 * kahin nahi aati thin.
 */
export default function PhotoDetailsScreen({ route }) {
  const theme = useSectionTheme();
  const { item } = route.params || {};
  const [extras, setExtras] = useState(Array.isArray(item?.extras) ? item.extras : null);
  const [loadingExtras, setLoadingExtras] = useState(!Array.isArray(item?.extras));
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  // Naya backend extras saath bhejta hai; purane ke liye alag se laao.
  useEffect(() => {
    let alive = true;
    if (Array.isArray(item?.extras) || !item?.id) { setLoadingExtras(false); return undefined; }
    extrasFor(item.id)
      .then((list) => { if (alive) setExtras(list); })
      .catch(() => { if (alive) setExtras([]); })
      .finally(() => { if (alive) setLoadingExtras(false); });
    return () => { alive = false; };
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const slides = useMemo(() => {
    const out = [];
    if (item?.image) out.push({ key: 'main', uri: mediaUrl(item.image), caption: '' });
    (extras || []).forEach((e) => {
      const uri = mediaUrl(e.image);
      if (uri) out.push({ key: `x${e.id}`, uri, caption: e.caption || '' });
    });
    return out;
  }, [item, extras]);

  const goTo = (i) => {
    const next = Math.max(0, Math.min(slides.length - 1, i));
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  };

  const current = slides[index];

  return (
    <Screen edges={['bottom']}>
      <Header
        title={item?.title || 'Photo'}
        subtitle={slides.length > 1 ? `${index + 1} / ${slides.length}` : undefined}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.stage}>
          <FlatList
            ref={listRef}
            data={slides}
            keyExtractor={(s) => s.key}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, i) => ({ length: SLIDE_W, offset: SLIDE_W * i, index: i })}
            onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / SLIDE_W))}
            renderItem={({ item: s }) => (
              <View style={styles.slide}>
                <Image source={{ uri: s.uri }} style={styles.img} resizeMode="contain" />
              </View>
            )}
          />

          {slides.length > 1 ? (
            <>
              {index > 0 ? (
                <Pressable style={[styles.arrow, { left: 8 }]} onPress={() => goTo(index - 1)} hitSlop={8}
                           accessibilityLabel="Previous photo">
                  <Ionicons name="chevron-back" size={22} color="#fff" />
                </Pressable>
              ) : null}
              {index < slides.length - 1 ? (
                <Pressable style={[styles.arrow, { right: 8 }]} onPress={() => goTo(index + 1)} hitSlop={8}
                           accessibilityLabel="Next photo">
                  <Ionicons name="chevron-forward" size={22} color="#fff" />
                </Pressable>
              ) : null}
            </>
          ) : null}
        </View>

        {slides.length > 1 ? (
          <FlatList
            data={slides}
            keyExtractor={(s) => `t${s.key}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbs}
            renderItem={({ item: s, index: i }) => (
              <Pressable onPress={() => goTo(i)}>
                <Image
                  source={{ uri: s.uri }}
                  style={[styles.thumb, i === index && { borderColor: theme.tint, borderWidth: 2.5 }]}
                />
              </Pressable>
            )}
          />
        ) : null}

        {loadingExtras ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.tint} />
            <Text style={styles.loadingText}>Album ki baaki photos aa rahi hain…</Text>
          </View>
        ) : null}

        <View style={styles.body}>
          {current?.caption ? <Text style={styles.caption}>{current.caption}</Text> : null}
          {item?.title ? <Text style={styles.title}>{item.title}</Text> : null}
          {item?.description ? <Text style={styles.desc}>{item.description}</Text> : null}
          {item?.created_at ? <Text style={styles.date}>{formatDate(item.created_at)}</Text> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { width, height: IMG_H, backgroundColor: '#000' },
  slide: { width: SLIDE_W, height: IMG_H, alignItems: 'center', justifyContent: 'center' },
  img: { width: SLIDE_W, height: IMG_H },
  arrow: {
    position: 'absolute', top: IMG_H / 2 - 20, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  thumbs: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  thumb: { width: 62, height: 62, borderRadius: radius.sm, backgroundColor: '#ddd', borderWidth: 1, borderColor: colors.border },
  loadingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  loadingText: { marginLeft: spacing.sm, color: colors.textMuted, fontSize: typography.small },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  caption: { fontSize: typography.small, color: colors.textMuted, fontStyle: 'italic', marginBottom: spacing.sm },
  title: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.text },
  desc: { fontSize: typography.body, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },
  date: { fontSize: typography.tiny, color: colors.textFaint, marginTop: spacing.md },
});
