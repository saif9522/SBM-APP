import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header } from '../../components';
import { colors, spacing, typography, radius, shadow } from '../../constants/theme';
import { EMERGENCY_PHONE } from '../../constants/config';
import useApi from '../../hooks/useApi';
import serviceApi from '../../api/serviceApi';
import CategoryServiceList from '../booking/CategoryServiceList';

export default function AmbulanceHomeScreen({ navigation }) {
  const query = useApi(() => serviceApi.servicesByCategoryCode('ambulance'), []);

  const callEmergency = async () => {
    const url = `tel:${EMERGENCY_PHONE}`;
    const ok = await Linking.canOpenURL(url).catch(() => false);
    if (!ok) { Alert.alert('Cannot place call', 'Calling is not available on this device.'); return; }
    Linking.openURL(url);
  };

  return (
    <Screen edges={[]}>
      <Header title="Ambulance" onBack={() => navigation.goBack()} />

      <Pressable style={styles.sos} onPress={callEmergency}>
        <View style={styles.sosIcon}><Ionicons name="call" size={24} color={colors.accent} /></View>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.sosTitle}>Emergency call</Text>
          <Text style={styles.sosSub}>Dial {EMERGENCY_PHONE} for immediate help</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.accent} />
      </Pressable>

      <Text style={styles.or}>Or request an ambulance service below</Text>

      <CategoryServiceList
        query={query}
        emptyText="No ambulance services listed right now — use the emergency call above."
        onSelect={(service) => navigation.navigate('AmbulanceBooking', { service, category: query.data?.category })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sos: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentLight,
    margin: spacing.lg, marginBottom: spacing.sm, padding: spacing.lg, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.accent, ...shadow.card,
  },
  sosIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  sosTitle: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.text },
  sosSub: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
  or: { textAlign: 'center', color: colors.textFaint, fontSize: typography.small, marginVertical: spacing.sm },
});
