import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, Button } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';

export default function DonationHomeScreen({ navigation }) {
  return (
    <Screen edges={[]}>
      <Header title="Donate" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={styles.hero}>
          <Ionicons name="heart" size={28} color={colors.danger} />
          <Text style={styles.heroText}>Your contribution supports cleanliness and community welfare across Garhwa.</Text>
        </Card>
        <Button title="Donate now" icon={<Ionicons name="heart" size={18} color="#fff" />} onPress={() => navigation.navigate('DonationForm')} />
        <Card onPress={() => navigation.navigate('DonationHistory')} style={styles.row}>
          <View style={styles.icon}><Ionicons name="time" size={22} color={colors.primary} /></View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.label}>Donation History</Text>
            <Text style={styles.desc}>See your past donations</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </Card>
      </ScrollView>
    </Screen>
  );
}
const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDECEC', marginBottom: spacing.lg },
  heroText: { flex: 1, marginLeft: spacing.md, color: colors.text, fontSize: typography.small, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  icon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  desc: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
});
