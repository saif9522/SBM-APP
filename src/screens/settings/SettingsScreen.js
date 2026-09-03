import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Switch, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, ConfirmDialog } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { WEB_PAGES, APP_VERSION } from '../../constants/config';
import { getPref, setPref } from '../../utils/prefs';
import { useAuth } from '../../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { logout } = useAuth();
  const [notif, setNotif] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => { getPref('notifications', true).then(setNotif); }, []);

  const toggleNotif = (val) => { setNotif(val); setPref('notifications', val); };

  const openUrl = async (url) => {
    const ok = await Linking.canOpenURL(url).catch(() => false);
    if (ok) Linking.openURL(url); else Alert.alert('Could not open link');
  };

  const doLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <SectionLabel text="Preferences" />
        <Card padded={false}>
          <View style={[styles.row, styles.border]}>
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            <Text style={styles.rowLabel}>Notification alerts</Text>
            <Switch value={notif} onValueChange={toggleNotif} trackColor={{ true: colors.primary }} thumbColor="#fff" />
          </View>
          <Pressable style={styles.row} onPress={() => Alert.alert('Language', 'English is currently available. More languages are coming soon.')}>
            <Ionicons name="language-outline" size={20} color={colors.primary} />
            <Text style={styles.rowLabel}>Language</Text>
            <Text style={styles.value}>English</Text>
          </Pressable>
        </Card>

        <SectionLabel text="Account" />
        <Card padded={false}>
          <Nav icon="key-outline" label="Change password" onPress={() => navigation.navigate('ChangePassword')} border />
          <Nav icon="person-outline" label="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
        </Card>

        <SectionLabel text="About & Support" />
        <Card padded={false}>
          <Nav icon="information-circle-outline" label="About app" onPress={() => navigation.navigate('About')} border />
          <Nav icon="shield-checkmark-outline" label="Privacy policy" onPress={() => openUrl(WEB_PAGES.privacy)} border />
          <Nav icon="mail-outline" label="Contact us" onPress={() => navigation.navigate('ContactUs')} />
        </Card>

        <Pressable style={styles.logout} onPress={() => setConfirmLogout(true)}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>

        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </ScrollView>

      <ConfirmDialog
        visible={confirmLogout}
        title="Log out?"
        message="You'll need to sign in again to access your account."
        confirmLabel="Log out"
        destructive
        loading={loggingOut}
        onConfirm={doLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </Screen>
  );
}

function SectionLabel({ text }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}
function Nav({ icon, label, onPress, border }) {
  return (
    <Pressable style={[styles.row, border && styles.border]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  sectionLabel: { fontSize: typography.small, color: colors.textFaint, fontWeight: typography.medium, marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  rowLabel: { flex: 1, marginLeft: spacing.md, fontSize: typography.body, color: colors.text },
  value: { fontSize: typography.small, color: colors.textMuted },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, paddingVertical: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.danger },
  logoutText: { color: colors.danger, fontWeight: typography.semibold, marginLeft: spacing.sm, fontSize: typography.body },
  version: { textAlign: 'center', color: colors.textFaint, fontSize: typography.tiny, marginTop: spacing.xl },
});
