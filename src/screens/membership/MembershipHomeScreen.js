import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import serviceApi from '../../api/serviceApi';
import CategoryServiceList from '../booking/CategoryServiceList';

/**
 * Membership maps to the backend's 'membership' ServiceCategory. Plans are the
 * services within it; applying reuses the standard service-application flow.
 */
export default function MembershipHomeScreen({ navigation }) {
  const query = useApi(() => serviceApi.servicesByCategoryCode('membership'), []);
  return (
    <Screen edges={['top']}>
      <Header title="Membership" onBack={() => navigation.goBack()} />
      <View style={styles.banner}>
        <Ionicons name="people" size={22} color={colors.primary} />
        <Text style={styles.bannerText}>Choose a membership plan to view details and apply.</Text>
      </View>
      <CategoryServiceList
        query={query}
        emptyText="No membership plans are available right now."
        onSelect={(service) => navigation.navigate('ServiceDetails', { service, categoryIcon: query.data?.category?.icon })}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, margin: spacing.lg, marginBottom: 0, padding: spacing.lg, borderRadius: radius.md },
  bannerText: { flex: 1, marginLeft: spacing.md, color: colors.primaryDark, fontSize: typography.small, lineHeight: 19 },
});
