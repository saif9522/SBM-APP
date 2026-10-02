import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import useApi from '../../hooks/useApi';
import serviceApi from '../../api/serviceApi';
import CategoryServiceList from '../booking/CategoryServiceList';

export default function AutoHomeScreen({ navigation }) {
  const query = useApi(() => serviceApi.servicesByCategoryCode('auto'), []);
  return (
    <Screen edges={[]}>
      <Header
        title="Auto & Rickshaw"
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={() => navigation.navigate('Bookings')} hitSlop={10}>
            <Ionicons name="briefcase-outline" size={22} color="#fff" />
          </Pressable>
        }
      />
      <View style={styles.banner}>
        <Ionicons name="car" size={22} color={colors.primary} />
        <Text style={styles.bannerText}>Choose a service to set pickup, drop and confirm your booking.</Text>
      </View>
      <CategoryServiceList
        query={query}
        emptyText="Auto services aren't available in your area yet."
        onSelect={(service) => navigation.navigate('AutoBooking', { service, category: query.data?.category })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, margin: spacing.lg, marginBottom: 0, padding: spacing.lg, borderRadius: radius.md },
  bannerText: { flex: 1, marginLeft: spacing.md, color: colors.primaryDark, fontSize: typography.small, lineHeight: 19 },
});
