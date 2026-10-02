import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, Button } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/format';
import { openInTab } from '../../navigation/navHelpers';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const name = user?.name || 'Guest';

  const MENU = [
    { key: 'apps', label: 'My Applications', icon: 'document-text-outline', onPress: () => openInTab(navigation, 'Services', 'MyApplications') },
    { key: 'bookings', label: 'My Bookings', icon: 'briefcase-outline', onPress: () => navigation.navigate('Bookings') },
    { key: 'complaints', label: 'My Complaints', icon: 'megaphone-outline', onPress: () => openInTab(navigation, 'Services', 'MyComplaints') },
    { key: 'donations', label: 'My Donations', icon: 'heart-outline', onPress: () => openInTab(navigation, 'Services', 'DonationHistory') },
    { key: 'pass', label: 'My Pass', icon: 'card-outline', onPress: () => openInTab(navigation, 'Services', 'MyPasses') },
    { key: 'notifications', label: 'Notifications', icon: 'notifications-outline', onPress: () => navigation.navigate('Notifications') },
    { key: 'gallery', label: 'Gallery', icon: 'images-outline', onPress: () => openInTab(navigation, 'Services', 'Gallery') },
    { key: 'careers', label: 'Careers', icon: 'briefcase-outline', onPress: () => openInTab(navigation, 'Services', 'CareerHome') },
    { key: 'settings', label: 'Settings', icon: 'settings-outline', onPress: () => navigation.navigate('Settings') },
    { key: 'about', label: 'About', icon: 'information-circle-outline', onPress: () => navigation.navigate('About') },
  ];

  const onLogout = async () => { setBusy(true); await logout(); };

  return (
    <Screen edges={['bottom']}>
      <Header
        title="Profile"
        right={
          <Pressable onPress={() => navigation.navigate('EditProfile')} hitSlop={10}>
            <Ionicons name="create-outline" size={22} color="#fff" />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={styles.head}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials(name) || 'G'}</Text></View>
          <View style={{ flex: 1, marginLeft: spacing.lg }}>
            <Text style={styles.name}>{name}</Text>
            {user?.phone ? <Text style={styles.muted}>{user.phone}</Text> : null}
            {user?.email ? <Text style={styles.muted}>{user.email}</Text> : null}
          </View>
          <Pressable onPress={() => navigation.navigate('EditProfile')} hitSlop={8}>
            <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
          </Pressable>
        </Card>

        <Card padded={false} style={{ marginTop: spacing.lg }}>
          {MENU.map((m, i) => (
            <Pressable key={m.key} onPress={m.onPress} style={[styles.row, i < MENU.length - 1 && styles.rowBorder]}>
              <Ionicons name={m.icon} size={20} color={colors.primary} />
              <Text style={styles.rowLabel}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Pressable>
          ))}
        </Card>

        <Button title="Log out" variant="outline" onPress={onLogout} loading={busy} style={{ marginTop: spacing.xl }} />
        <Text style={styles.note}>More sections (donations, pass, membership) connect in later phases.</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  head: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: typography.h3, fontWeight: typography.bold },
  name: { fontSize: typography.h3, fontWeight: typography.semibold, color: colors.text },
  muted: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  rowLabel: { flex: 1, marginLeft: spacing.md, fontSize: typography.body, color: colors.text },
  note: { textAlign: 'center', color: colors.textFaint, fontSize: typography.tiny, marginTop: spacing.lg },
});
