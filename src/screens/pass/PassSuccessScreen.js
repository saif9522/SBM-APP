import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, Card } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';

export default function PassSuccessScreen({ route, navigation }) {
  const { pass } = route.params || {};
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.circle}><Ionicons name="checkmark" size={48} color="#fff" /></View>
        <Text style={styles.title}>Application submitted</Text>
        <Text style={styles.sub}>Once approved, your digital pass with QR will be available under My Passes.</Text>
        <Card style={styles.card}>
          {pass?.pass_id ? <Row label="Pass ID" value={pass.pass_id} /> : null}
          <Row label="Type" value={pass?.pass_type} />
          <Row label="Status" value={pass?.status || 'applied'} />
        </Card>
        <View style={{ flex: 1 }} />
        <Button title="View my passes" onPress={() => navigation.replace('MyPasses')} />
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
