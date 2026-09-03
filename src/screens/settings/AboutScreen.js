import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Linking } from 'react-native';
import { Screen, Header, Card, Button } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { APP_NAME, APP_VERSION, WEB_PAGES, SITE_BASE_URL } from '../../constants/config';
import { LOGO } from '../../constants/assets';

export default function AboutScreen({ navigation }) {
  return (
    <Screen edges={['top']}>
      <Header title="About" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={styles.name}>{APP_NAME}</Text>
        <Text style={styles.version}>Version {APP_VERSION}</Text>

        <Card style={styles.card}>
          <Text style={styles.text}>
            The Swachh Bharat Mission Foundation app brings community services, bookings,
            complaints, donations and more into one place — making it easier for citizens
            to access support and participate in cleanliness and welfare initiatives.
          </Text>
        </Card>

        <Button title="Visit website" variant="outline" onPress={() => Linking.openURL(SITE_BASE_URL)} />
        <Button title="Privacy policy" variant="ghost" onPress={() => Linking.openURL(WEB_PAGES.privacy)} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.xl, alignItems: 'center' },
  logo: { width: 110, height: 110, marginTop: spacing.lg },
  name: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.text, marginTop: spacing.lg, textAlign: 'center' },
  version: { fontSize: typography.small, color: colors.textMuted, marginTop: spacing.xs },
  card: { marginVertical: spacing.xl },
  text: { fontSize: typography.body, color: colors.textMuted, lineHeight: 23, textAlign: 'center' },
});
