import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../constants/theme';

/**
 * Auto-sliding home banner (phone-reliable ScrollView).
 *
 * Har slide me `aspect` (width/height) do to us image ki height uske apne
 * aspect ke hisaab se set hoti hai — image poora width bharti hai, na crop,
 * na white space. Jo slide chhoti ho wo theme background par center ho jaati.
 */
export default function BannerSlider({ slides = [], height = 150, interval = 3800 }) {
  const scrollRef = useRef(null);
  const [w, setW] = useState(Math.round(Dimensions.get('window').width - spacing.lg * 2));
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  useEffect(() => { indexRef.current = index; }, [index]);

  useEffect(() => {
    if (slides.length <= 1 || !w) return undefined;
    const t = setInterval(() => {
      const next = (indexRef.current + 1) % slides.length;
      scrollRef.current?.scrollTo({ x: next * w, y: 0, animated: true });
      setIndex(next);
    }, interval);
    return () => clearInterval(t);
  }, [slides.length, w, interval]);

  if (!slides.length) return null;

  const heightFor = (item) => (item.aspect && w ? Math.round(w / item.aspect) : height);
  const containerH = Math.max(height, ...slides.map(heightFor));

  return (
    <View onLayout={(e) => {
      const width = Math.round(e.nativeEvent.layout.width);
      if (width && Math.abs(width - w) > 1) setW(width);
    }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={{ height: containerH }}
        contentContainerStyle={{ alignItems: 'center' }}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / w))}
      >
        {slides.map((item, i) => {
          const slideH = heightFor(item);
          return (
            <Pressable
              key={String(item.key ?? i)}
              onPress={item.onPress}
              style={[styles.slide, { width: w, height: slideH, backgroundColor: item.bg || colors.primary }]}
            >
              {item.image ? (
                <>
                  <Image source={item.image} style={{ width: w, height: slideH }} resizeMode={item.resizeMode || 'cover'} />
                  {(item.title || item.subtitle) ? <View style={styles.scrim} /> : null}
                </>
              ) : null}

              {(item.icon || item.title || item.subtitle || item.actionLabel) ? (
                <View style={styles.content}>
                  {item.icon ? (
                    <View style={styles.iconWrap}>
                      <Ionicons name={item.icon} size={22} color="#fff" />
                    </View>
                  ) : null}
                  {item.title ? <Text style={styles.title} numberOfLines={2}>{item.title}</Text> : null}
                  {item.subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text> : null}
                  {item.actionLabel ? (
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>{item.actionLabel}</Text>
                      <Ionicons name="arrow-forward" size={13} color={colors.primaryDark} />
                    </View>
                  ) : null}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {slides.length > 1 ? (
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={String(s.key ?? i)} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.32)' },
  content: { padding: spacing.lg, position: 'absolute', left: 0, right: 0, bottom: 0 },
  iconWrap: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  title: { color: '#fff', fontSize: typography.h3, fontWeight: typography.bold },
  subtitle: { color: 'rgba(255,255,255,0.92)', fontSize: typography.small, marginTop: 2, lineHeight: 18 },
  pill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#fff', borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: 6, marginTop: spacing.md,
  },
  pillText: { color: colors.primaryDark, fontSize: typography.tiny, fontWeight: typography.bold, marginRight: 4 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border, marginHorizontal: 3 },
  dotActive: { width: 20, backgroundColor: colors.primary },
});
