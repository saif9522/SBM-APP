import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header } from '../../components';
import { colors, spacing, typography, radius, shadow } from '../../constants/theme';
import { WEB_PAGES } from '../../constants/config';

const LAST_UPDATED = 'June 2026';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    intro: 'We may collect the following information:',
    bullets: [
      'Name of applicant',
      'Mobile number',
      'Email address (if provided)',
      'Residential address',
      'Aadhaar number (where applicable)',
      'Family information',
      'Bank details (if required under government schemes)',
      'Photographs and supporting documents',
      'Complaint and grievance details',
    ],
  },
  {
    title: '2. Purpose of Information Collection',
    intro: 'Your information is collected for:',
    bullets: [
      'Processing your service applications',
      'Verification of beneficiary eligibility',
      'Managing grievances and complaints',
      'Providing service updates and notifications',
      'Reporting and monitoring as required',
      'Preventing fraud and misuse of public services',
    ],
  },
  {
    title: '3. Information Security',
    body: 'We implement reasonable administrative, technical, and physical safeguards to protect personal information from unauthorized access, disclosure, alteration, or destruction.',
  },
  {
    title: '4. Data Sharing',
    body: 'Information may be shared only with authorized team members, partners, and relevant authorities where required to deliver our services or to help you access government schemes. We do not sell, rent, or trade your personal information to any private third party.',
  },
  {
    title: '5. Cookies',
    body: 'The portal may use cookies and session data to improve functionality, user experience, and security.',
  },
  {
    title: '6. User Responsibilities',
    bullets: [
      'Provide accurate and complete information',
      'Keep your login credentials secure',
      'Avoid submitting false or misleading information',
    ],
  },
  {
    title: '7. Third-Party Links',
    body: 'This app may contain links to external websites and services. We are not responsible for the privacy practices of those external websites.',
  },
  {
    title: '8. Changes to This Privacy Policy',
    body: 'SBM Garhwa reserves the right to update this Privacy Policy at any time. Changes will be published here.',
  },
  {
    title: '9. Contact',
    body: 'Swachh Bharat Mission Foundation (NGO), Garhwa.\nOffice: Garhwa Nagar Parishad, Garhwa, Jharkhand 822114.\nCorporate Office: Sonpurwa Tandi, Ward No. 06, Garhwa, Jharkhand – 822114.\nPhone: +91 94312 52735\nEmail: swachhbharatmissionfoundation@gmail.com',
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  const openWeb = async () => {
    const url = WEB_PAGES.privacy;
    const ok = await Linking.canOpenURL(url).catch(() => false);
    if (ok) Linking.openURL(url); else Alert.alert('Could not open link');
  };

  return (
    <Screen edges={['bottom']}>
      <Header title="Privacy Policy" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark" size={26} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Your privacy matters</Text>
          <Text style={styles.heroSub}>
            Swachh Bharat Mission Foundation is a non-profit organisation (NGO). This explains how we collect, use and protect your information.
          </Text>
          <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>
        </View>

        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.card}>
            <Text style={styles.sTitle}>{s.title}</Text>
            {s.intro ? <Text style={styles.sBody}>{s.intro}</Text> : null}
            {s.body ? <Text style={styles.sBody}>{s.body}</Text> : null}
            {s.bullets ? s.bullets.map((b) => (
              <View key={b} style={styles.bulletRow}>
                <View style={styles.dot} />
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            )) : null}
          </View>
        ))}

        <Pressable style={styles.webBtn} onPress={openWeb}>
          <Ionicons name="open-outline" size={18} color={colors.primary} />
          <Text style={styles.webBtnText}>View full policy on website</Text>
        </Pressable>

        <Text style={styles.foot}>
          By using this app, you acknowledge that you have read and agree to this Privacy Policy.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  hero: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl,
    alignItems: 'center', marginBottom: spacing.lg, ...shadow.card,
  },
  heroIcon: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  heroTitle: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.text },
  heroSub: { fontSize: typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  updated: { fontSize: typography.tiny, color: colors.textFaint, marginTop: spacing.md },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadow.card },
  sTitle: { fontSize: typography.body, fontWeight: typography.bold, color: colors.text, marginBottom: spacing.sm },
  sBody: { fontSize: typography.small, color: colors.textMuted, lineHeight: 21 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 7, marginRight: spacing.md },
  bulletText: { flex: 1, fontSize: typography.small, color: colors.textMuted, lineHeight: 20 },

  webBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.sm, paddingVertical: spacing.lg, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  webBtnText: { color: colors.primary, fontWeight: typography.semibold, marginLeft: spacing.sm, fontSize: typography.small },
  foot: { fontSize: typography.tiny, color: colors.textFaint, textAlign: 'center', marginTop: spacing.lg, lineHeight: 17 },
});
