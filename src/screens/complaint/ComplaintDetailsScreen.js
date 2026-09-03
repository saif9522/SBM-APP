import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, StatusBadge } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { formatDate, mediaUrl } from '../../utils/format';

// Backend status flow: pending -> processing -> resolved
const STEPS = [
  { key: 'pending', label: 'Filed', icon: 'create-outline' },
  { key: 'processing', label: 'In progress', icon: 'construct-outline' },
  { key: 'resolved', label: 'Resolved', icon: 'checkmark-done-outline' },
];
const LABEL = { light: 'Light', water: 'Water', garbage: 'Garbage', drainage: 'Drainage', toilet: 'Toilet', road: 'Road', street_light: 'Street Light', park: 'Park', other: 'Other' };

export default function ComplaintDetailsScreen({ route, navigation }) {
  const { complaint: c } = route.params || {};
  const img = mediaUrl(c?.image);
  const currentIndex = STEPS.findIndex((s) => s.key === c?.status);

  return (
    <Screen edges={['top']}>
      <Header title="Complaint details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={styles.head}>
          <View>
            <Text style={styles.type}>{LABEL[c?.complaint_type] || c?.complaint_type}</Text>
            <Text style={styles.id}>#{c?.id} · {formatDate(c?.created_at)}</Text>
          </View>
          <StatusBadge status={c?.status} />
        </Card>

        {/* Status tracker */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Track</Text>
          {STEPS.map((s, i) => {
            const done = currentIndex >= 0 && i <= currentIndex;
            const isRejectedNote = false;
            return (
              <View key={s.key} style={styles.step}>
                <View style={[styles.stepIcon, done && styles.stepIconDone]}>
                  <Ionicons name={s.icon} size={16} color={done ? '#fff' : colors.textFaint} />
                </View>
                <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{s.label}</Text>
                {i < STEPS.length - 1 ? <View style={[styles.stepLine, done && styles.stepLineDone]} /> : null}
              </View>
            );
          })}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.desc}>{c?.description}</Text>
          {c?.location ? <Text style={styles.loc}>📍 {c.location}</Text> : null}
          {c?.gps_latitude ? <Text style={styles.loc}>GPS: {c.gps_latitude}, {c.gps_longitude}</Text> : null}
          {c?.admin_note ? (
            <View style={styles.adminNote}>
              <Text style={styles.adminLabel}>Note from the team</Text>
              <Text style={styles.desc}>{c.admin_note}</Text>
            </View>
          ) : null}
        </Card>

        {img ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Attachment</Text>
            <Image source={{ uri: img }} style={styles.img} resizeMode="cover" />
          </Card>
        ) : null}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  type: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.text },
  id: { fontSize: typography.tiny, color: colors.textFaint, marginTop: 2 },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, marginBottom: spacing.md },
  step: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, position: 'relative' },
  stepIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepIconDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepLabel: { marginLeft: spacing.md, fontSize: typography.small, color: colors.textMuted },
  stepLabelDone: { color: colors.text, fontWeight: typography.medium },
  stepLine: { position: 'absolute', left: 14, top: 38, width: 2, height: 18, backgroundColor: colors.border },
  stepLineDone: { backgroundColor: colors.primary },
  desc: { fontSize: typography.body, color: colors.textMuted, lineHeight: 22 },
  loc: { fontSize: typography.small, color: colors.textFaint, marginTop: spacing.sm },
  adminNote: { marginTop: spacing.lg, backgroundColor: colors.primarySoft, padding: spacing.md, borderRadius: 10 },
  adminLabel: { fontSize: typography.tiny, fontWeight: typography.semibold, color: colors.primaryDark, marginBottom: spacing.xs },
  img: { width: '100%', height: 200, borderRadius: 12 },
});
