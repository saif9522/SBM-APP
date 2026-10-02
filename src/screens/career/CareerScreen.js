import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { POSITIONS } from '../../api/careerApi';

export default function CareerScreen({ navigation }) {
  return (
    <Screen edges={[]}>
      <Header
        title="Careers"
        onBack={() => navigation.goBack()}
        right={<Text style={styles.myLink} onPress={() => navigation.navigate('MyJobApplications')}>Mine</Text>}
      />
      <FlatList
        data={POSITIONS}
        keyExtractor={(p) => p.value}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.intro}>Open positions at the Foundation. Tap a role to view and apply.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('JobDetails', { position: item })}>
            <View style={styles.icon}><Ionicons name="briefcase-outline" size={20} color={colors.primary} /></View>
            <Text style={styles.name}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  myLink: { color: "#fff", fontWeight: typography.semibold, fontSize: typography.small },
  list: { padding: spacing.lg },
  intro: { fontSize: typography.small, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 19 },
  card: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  icon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  name: { flex: 1, fontSize: typography.body, fontWeight: typography.medium, color: colors.text },
});
