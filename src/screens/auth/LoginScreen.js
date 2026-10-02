import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthLayout from './_AuthLayout';
import { Input, Button } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

export default function LoginScreen({ navigation }) {
  const { loginWithPassword } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState('');

  const onLogin = async () => {
    Keyboard.dismiss();
    const { errors: e, isValid } = v.validate({
      phone: () => v.phone(phone),
      password: () => v.password(password),
    });
    setErrors(e);
    if (!isValid) {
      setBanner('Please enter a valid mobile number and password.');
      return;
    }
    setBanner('');
    setBusy(true);
    try {
      await loginWithPassword({ phone: phone.trim(), password, role: 'user' });
      // success -> RootNavigator switches to the app automatically.
    } catch (err) {
      setBanner(friendlyError(err) || 'Invalid credentials');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to access your services and requests.">
      {banner ? <Text style={styles.banner}>{banner}</Text> : null}

      <Input
        label="Mobile number"
        value={phone}
        onChangeText={setPhone}
        placeholder="10-digit mobile number"
        keyboardType="phone-pad"
        leftIcon="call-outline"
        maxLength={10}
        autoCapitalize="none"
        error={errors.phone}
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry
        leftIcon="lock-closed-outline"
        error={errors.password}
      />

      <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8} style={styles.forgot}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>

      <Button title="Sign in" onPress={onLogin} loading={busy} icon={<Ionicons name="lock-open-outline" size={18} color="#fff" />} />

      <View style={styles.footer}>
        <Text style={styles.muted}>New here? </Text>
        <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
          <Text style={styles.link}>Create an account</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.accentLight, color: colors.text, padding: spacing.md,
    borderRadius: 10, marginBottom: spacing.lg, fontSize: typography.small, lineHeight: 19,
  },
  forgot: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  link: { color: colors.primary, fontWeight: typography.semibold, fontSize: typography.small },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  muted: { color: colors.textMuted, fontSize: typography.small },
});
