import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';

const ACTIONS = [
  { key: 'BloodDonors', label: 'Find Donors', icon: 'search', desc: 'Search available donors by blood group', tint: colors.danger },
  { key: 'CreateBloodRequest', label: 'Request Blood', icon: 'add-circle', desc: 'Raise a new blood requirement', tint: colors.primary },
  { key: 'BecomeDonor', label: 'Become a Donor', icon: 'heart', desc: 'Register to donate blood', tint: colors.accent },
  { key: 'MyBloodRequests', label: 'My Requests', icon: 'list', desc: 'Track your blood requests', tint: colors.processing },
];

export default function BloodHomeScreen({ navigation }) {
  return (
    <Screen edges={[]}>
      <Header title="Blood Donation" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={styles.hero}>
          <Ionicons name="water" size={30} color={colors.danger} />
          <Text style={styles.heroText}>Donate blood, save lives. Find donors or raise a request in minutes.</Text>
        </Card>

        {ACTIONS.map((a) => (
          <Card key={a.key} onPress={() => navigation.navigate(a.key)} style={styles.row}>
            <View style={[styles.icon, { backgroundColor: `${a.tint}14` }]}>
              <Ionicons name={a.icon} size={22} color={a.tint} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.label}>{a.label}</Text>
              <Text style={styles.desc}>{a.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDECEC', marginBottom: spacing.lg },
  heroText: { flex: 1, marginLeft: spacing.md, color: colors.text, fontSize: typography.small, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  icon: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  desc: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
});
