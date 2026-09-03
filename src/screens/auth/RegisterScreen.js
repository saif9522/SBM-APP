import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AuthLayout from './_AuthLayout';
import { Input, Button } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', ward_no: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState('');
  const set = (k) => (val) => setF((s) => ({ ...s, [k]: val }));

  const onSubmit = async () => {
    const { errors: e, isValid } = v.validate({
      name: () => v.required(f.name, 'Full name'),
      phone: () => v.phone(f.phone),
      email: () => v.email(f.email),
      password: () => v.password(f.password),
      confirm: () => v.confirmPassword(f.confirm, f.password),
    });
    setErrors(e);
    if (!isValid) return;
    setBanner('');
    setBusy(true);
    try {
      await register({
        name: f.name.trim(),
        phone: f.phone.trim(),
        email: f.email.trim(),
        address: f.address.trim(),
        ward_no: f.ward_no.trim(),
        password: f.password,
      });
      navigation.navigate('Otp', { phone: f.phone.trim(), flow: 'register' });
    } catch (err) {
      setBanner(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Register once to use every Foundation service.">
      {banner ? <Text style={styles.banner}>{banner}</Text> : null}

      <Input label="Full name" value={f.name} onChangeText={set('name')} placeholder="Your name" leftIcon="person-outline" error={errors.name} />
      <Input label="Mobile number" value={f.phone} onChangeText={set('phone')} placeholder="10-digit mobile number" keyboardType="phone-pad" leftIcon="call-outline" maxLength={10} error={errors.phone} />
      <Input label="Email (optional)" value={f.email} onChangeText={set('email')} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" error={errors.email} />
      <Input label="Address (optional)" value={f.address} onChangeText={set('address')} placeholder="Your address" leftIcon="home-outline" multiline />
      <Input label="Ward no. (optional)" value={f.ward_no} onChangeText={set('ward_no')} placeholder="e.g. 12" leftIcon="location-outline" />
      <Input label="Password" value={f.password} onChangeText={set('password')} placeholder="At least 6 characters" secureTextEntry leftIcon="lock-closed-outline" error={errors.password} />
      <Input label="Confirm password" value={f.confirm} onChangeText={set('confirm')} placeholder="Re-enter password" secureTextEntry leftIcon="lock-closed-outline" error={errors.confirm} />

      <Button title="Send OTP" onPress={onSubmit} loading={busy} />

      <View style={styles.footer}>
        <Text style={styles.muted}>Already registered? </Text>
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
          <Text style={styles.link}>Sign in</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.accentLight, color: colors.text, padding: spacing.md, borderRadius: 10, marginBottom: spacing.lg, fontSize: typography.small, lineHeight: 19 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  muted: { color: colors.textMuted, fontSize: typography.small },
  link: { color: colors.primary, fontWeight: typography.semibold, fontSize: typography.small },
});
