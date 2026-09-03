import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Screen, Header } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { mediaUrl, formatDate } from '../../utils/format';

const { width } = Dimensions.get('window');

export default function PhotoDetailsScreen({ route, navigation }) {
  const { item } = route.params || {};
  const uri = mediaUrl(item?.image);
  return (
    <Screen edges={['top']}>
      <Header title={item?.title || 'Photo'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        {uri ? <Image source={{ uri }} style={styles.img} resizeMode="contain" /> : null}
        {item?.title ? <Text style={styles.title}>{item.title}</Text> : null}
        {item?.description ? <Text style={styles.desc}>{item.description}</Text> : null}
        {item?.created_at ? <Text style={styles.date}>{formatDate(item.created_at)}</Text> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  img: { width: width - spacing.lg * 2, height: width - spacing.lg * 2, borderRadius: 12, backgroundColor: '#000' },
  title: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.text, marginTop: spacing.lg },
  desc: { fontSize: typography.body, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },
  date: { fontSize: typography.tiny, color: colors.textFaint, marginTop: spacing.md },
});
