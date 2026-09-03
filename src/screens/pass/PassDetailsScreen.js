import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Screen, Header, Card, StatusBadge, QrView } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { formatDate } from '../../utils/format';

const TYPE_LABEL = { bus: 'Bus Pass', auto: 'Auto Pass' };
const CAT_LABEL = { women: 'Women', student: 'Student', senior: 'Senior Citizen', employee: 'Employee' };

function Row({ label, value }) {
  if (!value) return null;
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;
}

export default function PassDetailsScreen({ route, navigation }) {
  const { pass: p } = route.params || {};
  const approved = p?.status === 'approved';
  // QR encodes the unique pass id (backend-provided). Falls back to text if the
  // QR library isn't installed — see components/QrView.js.
  const qrValue = p?.pass_id || `PASS-${p?.id}`;

  return (
    <Screen edges={['top']}>
      <Header title="Pass" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        {/* Digital pass card */}
        <View style={styles.passCard}>
          <View style={styles.passTop}>
            <Text style={styles.passType}>{TYPE_LABEL[p?.pass_type] || p?.pass_type}</Text>
            <StatusBadge status={p?.status} />
          </View>
          <Text style={styles.holder}>{p?.holder_name}</Text>
          <Text style={styles.passMeta}>{CAT_LABEL[p?.category] || p?.category} · {p?.duration}</Text>
          <Text style={styles.passId}>{p?.pass_id || `#${p?.id}`}</Text>
        </View>

        {approved ? (
          <Card style={styles.qrCard}>
            <Text style={styles.qrTitle}>Show this at boarding</Text>
            <QrView value={qrValue} />
          </Card>
        ) : (
          <Card style={styles.pendingCard}>
            <Text style={styles.pendingText}>
              Your QR will appear here once the pass is approved. Current status: {p?.status}.
            </Text>
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Row label="Holder" value={p?.holder_name} />
          <Row label="Age" value={p?.age ? `${p.age} yrs` : null} />
          <Row label="Phone" value={p?.phone} />
          <Row label="Route / Area" value={p?.route_area} />
          <Row label="Issued on" value={p?.issued_on ? formatDate(p.issued_on) : null} />
          <Row label="Valid upto" value={p?.valid_upto ? formatDate(p.valid_upto) : null} />
        </Card>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  passCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.xl },
  passTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  passType: { color: '#fff', fontSize: typography.body, fontWeight: typography.bold, letterSpacing: 0.5 },
  holder: { color: '#fff', fontSize: typography.h2, fontWeight: typography.bold, marginTop: spacing.lg },
  passMeta: { color: 'rgba(255,255,255,0.9)', fontSize: typography.small, marginTop: 2, textTransform: 'capitalize' },
  passId: { color: 'rgba(255,255,255,0.95)', fontSize: typography.body, fontWeight: typography.semibold, marginTop: spacing.lg, letterSpacing: 1 },
  qrCard: { marginTop: spacing.lg, alignItems: 'center' },
  qrTitle: { fontSize: typography.small, color: colors.textMuted, marginBottom: spacing.md },
  pendingCard: { marginTop: spacing.lg, backgroundColor: colors.primarySoft },
  pendingText: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20, textTransform: 'capitalize' },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  label: { color: colors.textMuted, fontSize: typography.small },
  value: { color: colors.text, fontSize: typography.small, fontWeight: typography.medium, flex: 1, textAlign: 'right', marginLeft: spacing.lg },
});
