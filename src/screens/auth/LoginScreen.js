import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard } from 'react-native';
import AuthLayout from './_AuthLayout';
import { Input, Button } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

export default function LoginScreen({ navigation }) {
  const { loginWithPassword, requestLoginOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [banner, setBanner] = useState('');

  const onLogin = async () => {
    Keyboard.dismiss();
    const { errors: e, isValid } = v.validate({
      phone: () => v.phone(phone),
      password: () => v.password(password),
    });

    setErrors(e);
    if (!isValid) {
      setBanner('Please enter valid mobile number and password.');
      return;
    }

    setBanner('');
    setBusy(true);

    try {
      const res = await loginWithPassword({ phone: phone.trim(), password });

      // Agar backend ne direct login ke badle OTP bhej diya hai
      if (res?.raw?.otp_required || !res?.token) {
        navigation.navigate('Otp', { phone: phone.trim(), flow: 'login' });
        return;
      }
    } catch (err) {
      setBanner(friendlyError(err) || 'Invalid phone or password');
    } finally {
      setBusy(false);
    }
  };

  const onOtpLogin = async () => {
    Keyboard.dismiss();
    const msg = v.phone(phone);
    if (msg) return setErrors((s) => ({ ...s, phone: msg }));
    setBanner('');
    setOtpBusy(true);
    try {
      await requestLoginOtp(phone.trim());
      navigation.navigate('Otp', { phone: phone.trim(), flow: 'login' });
    } catch (err) {
      setBanner(friendlyError(err));
    } finally {
      setOtpBusy(false);
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

      <Button title="Sign in" onPress={onLogin} loading={busy} />

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>or</Text>
        <View style={styles.line} />
      </View>

      <Button title="Sign in with OTP" variant="outline" onPress={onOtpLogin} loading={otpBusy} />

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
    backgroundColor: colors.accentLight,
    color: colors.text,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.lg,
    fontSize: typography.small,
    lineHeight: 19,
  },
  forgot: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  link: { color: colors.primary, fontWeight: typography.semibold, fontSize: typography.small },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  or: { marginHorizontal: spacing.md, color: colors.textFaint, fontSize: typography.small },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  muted: { color: colors.textMuted, fontSize: typography.small },
});