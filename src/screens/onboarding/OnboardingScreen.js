import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { Button } from '../../components';
import useOnboarding from '../../hooks/useOnboarding';

const { width } = Dimensions.get('window');

const SLIDES = [
  { key: '1', icon: 'people-outline', title: 'Community Services', text: 'Apply for civic services, passes and support from the Foundation — all in one place.' },
  { key: '2', icon: 'flash-outline', title: 'Fast & Easy Booking', text: 'Book auto, ambulance and services in a few taps, and track their status live.' },
  { key: '3', icon: 'heart-outline', title: 'Help Your Community', text: 'Donate, register as a blood donor, and raise complaints that reach the right people.' },
];

export default function OnboardingScreen() {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const { complete } = useOnboarding();
  const isLast = index === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) return complete();
    listRef.current?.scrollToIndex({ index: index + 1 });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={complete} hitSlop={10}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(i) => i.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.illus}>
              <Ionicons name={item.icon} size={72} color={colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button title={isLast ? 'Get Started' : 'Next'} onPress={goNext} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  top: { alignItems: 'flex-end', padding: spacing.lg },
  skip: { color: colors.textMuted, fontSize: typography.body, fontWeight: typography.medium },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  illus: {
    width: 180, height: 180, borderRadius: 90, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl,
  },
  title: { fontSize: typography.h1, fontWeight: typography.bold, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  text: { fontSize: typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 23 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginVertical: spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginHorizontal: 4 },
  dotActive: { width: 22, backgroundColor: colors.primary },
  footer: { padding: spacing.xl },
});
