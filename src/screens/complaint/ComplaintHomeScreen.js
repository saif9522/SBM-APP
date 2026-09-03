import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, Button } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';

export default function ComplaintHomeScreen({ navigation }) {
  return (
    <Screen edges={['top']}>
      <Header title="Complaints" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={styles.hero}>
          <Ionicons name="megaphone" size={28} color={colors.processing} />
          <Text style={styles.heroText}>Report civic issues — water, roads, garbage, street lights and more. Attach a photo and location so it reaches the right team.</Text>
        </Card>

        <Button title="File a new complaint" icon={<Ionicons name="add" size={18} color="#fff" />} onPress={() => navigation.navigate('NewComplaint')} />
        <Card onPress={() => navigation.navigate('MyComplaints')} style={styles.row}>
          <View style={styles.icon}><Ionicons name="list" size={22} color={colors.primary} /></View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.label}>My Complaints</Text>
            <Text style={styles.desc}>Track status of your complaints</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E9F0FB', marginBottom: spacing.lg },
  heroText: { flex: 1, marginLeft: spacing.md, color: colors.text, fontSize: typography.small, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  icon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  desc: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
});
