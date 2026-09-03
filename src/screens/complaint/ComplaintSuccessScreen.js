import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, Card } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';

export default function ComplaintSuccessScreen({ route, navigation }) {
  const { complaint } = route.params || {};
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.circle}><Ionicons name="checkmark" size={48} color="#fff" /></View>
        <Text style={styles.title}>Complaint filed</Text>
        <Text style={styles.sub}>Your complaint has been registered. Track its status any time.</Text>
        <Card style={styles.card}>
          <Row label="Complaint ID" value={complaint?.id ? `#${complaint.id}` : null} />
          <Row label="Category" value={(complaint?.complaint_type || '').replace(/_/g, ' ')} />
          <Row label="Status" value={complaint?.status || 'pending'} />
        </Card>
        <View style={{ flex: 1 }} />
        <Button title="Track my complaints" onPress={() => navigation.replace('MyComplaints')} />
        <Button title="Done" variant="ghost" onPress={() => navigation.popToTop()} style={{ marginTop: spacing.sm }} />
      </View>
    </Screen>
  );
}
function Row({ label, value }) {
  if (!value) return null;
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View>;
}
const styles = StyleSheet.create({
  body: { flex: 1, padding: spacing.xl, alignItems: 'center' },
  circle: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xxl, marginBottom: spacing.lg },
  title: { fontSize: typography.h2, fontWeight: typography.bold, color: colors.text },
  sub: { fontSize: typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  card: { width: '100%', marginTop: spacing.xl },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  rowLabel: { color: colors.textMuted, fontSize: typography.small },
  rowValue: { color: colors.text, fontSize: typography.small, fontWeight: typography.semibold, textTransform: 'capitalize' },
});
