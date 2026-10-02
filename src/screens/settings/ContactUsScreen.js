import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Input, Button, Card } from '../../components';
import { colors, spacing, typography, radius, shadow } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import contactApi from '../../api/contactApi';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

const PHONE = '+91 94312 52735';
const PHONE_TEL = 'tel:+919431252735';
const EMAIL = 'swachhbharatmissionfoundation@gmail.com';
const WEBSITE = 'https://www.swachhbharatmissionfoundation.com/';

const open = (url) => Linking.openURL(url).catch(() => Alert.alert('Could not open link'));

export default function ContactUsScreen({ navigation }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const { errors: e, isValid } = v.validate({
      name: () => v.required(name, 'Name'),
      message: () => v.required(message, 'Message'),
      email: () => v.email(email),
    });
    setErrors(e);
    if (!isValid) return;
    setBusy(true);
    try {
      await contactApi.sendMessage({ name: name.trim(), phone: phone.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });
      Alert.alert('Message sent', 'Thank you for reaching out. We will get back to you.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Could not send', friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]}>
      <Header title="Contact Us" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Our Offices ── */}
          <Text style={styles.section}>Our Offices</Text>
          <Card style={styles.card}>
            <View style={styles.officeRow}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <View style={styles.officeText}>
                <Text style={styles.officeTitle}>Office</Text>
                <Text style={styles.officeBody}>Garhwa Nagar Parishad,{'\n'}Garhwa, Jharkhand 822114</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.officeRow}>
              <Ionicons name="business-outline" size={18} color={colors.primary} />
              <View style={styles.officeText}>
                <Text style={styles.officeTitle}>Corporate Office</Text>
                <Text style={styles.officeBody}>Sonpurwa Tandi, Ward No. 06,{'\n'}Garhwa, Jharkhand – 822114, India</Text>
              </View>
            </View>
          </Card>

          {/* ── Reach us ── */}
          <Text style={styles.section}>Reach Us</Text>
          <Card padded={false}>
            <Pressable style={[styles.row, styles.border]} onPress={() => open(PHONE_TEL)}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Phone</Text>
                <Text style={styles.rowValue}>{PHONE}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Pressable>
            <Pressable style={[styles.row, styles.border]} onPress={() => open(`mailto:${EMAIL}`)}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Email</Text>
                <Text style={styles.rowValue} numberOfLines={1}>{EMAIL}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Pressable>
            <Pressable style={[styles.row, styles.border]} onPress={() => open(WEBSITE)}>
              <Ionicons name="globe-outline" size={20} color={colors.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Website</Text>
                <Text style={styles.rowValue}>swachhbharatmissionfoundation.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Pressable>
            <View style={styles.row}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Working hours</Text>
                <Text style={styles.rowValue}>Mon–Fri, 10:00 AM – 5:00 PM</Text>
              </View>
            </View>
          </Card>

          {/* ── Emergency helpline ── */}
          <Pressable style={styles.emergency} onPress={() => open(PHONE_TEL)}>
            <View style={styles.emIcon}><Ionicons name="alert-circle" size={20} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emTitle}>Emergency Helpline (24×7)</Text>
              <Text style={styles.emNumber}>{PHONE}</Text>
            </View>
            <Ionicons name="call" size={18} color={colors.accent} />
          </Pressable>

          {/* ── Message form ── */}
          <Text style={styles.section}>Send us a message</Text>
          <Input label="Name" value={name} onChangeText={setName} leftIcon="person-outline" error={errors.name} />
          <Input label="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon="call-outline" maxLength={10} />
          <Input label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" error={errors.email} />
          <Input label="Subject (optional)" value={subject} onChangeText={setSubject} leftIcon="text-outline" />
          <Input label="Message" value={message} onChangeText={setMessage} placeholder="How can we help?" multiline error={errors.message} />

          <Button title="Send message" onPress={submit} loading={busy} style={{ marginTop: spacing.md }} />
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  section: { fontSize: typography.small, color: colors.textFaint, fontWeight: typography.medium, marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: spacing.xs },
  card: { padding: spacing.lg },
  officeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  officeText: { flex: 1, marginLeft: spacing.md },
  officeTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  officeBody: { fontSize: typography.small, color: colors.textMuted, marginTop: 2, lineHeight: 20 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginVertical: spacing.md },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  rowText: { flex: 1, marginLeft: spacing.md },
  rowLabel: { fontSize: typography.tiny, color: colors.textFaint },
  rowValue: { fontSize: typography.small, color: colors.text, fontWeight: typography.medium, marginTop: 1 },

  emergency: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentLight,
    borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg, ...shadow.card,
  },
  emIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  emTitle: { fontSize: typography.small, fontWeight: typography.semibold, color: colors.text },
  emNumber: { fontSize: typography.body, fontWeight: typography.bold, color: colors.accent, marginTop: 1 },
});
