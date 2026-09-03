import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AuthLayout from './_AuthLayout';
import { Input, Button } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import * as authApi from '../../api/authApi';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

/** Two-step reset: (1) phone -> OTP, (2) OTP + new password. */
export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState('');

  const sendOtp = async () => {
    const msg = v.phone(phone);
    if (msg) return setErrors({ phone: msg });
    setErrors({});
    setBanner('');
    setBusy(true);
    try {
      const res = await authApi.forgotPasswordSendOtp({ phone: phone.trim() });
      if (res?.status === 'error') { setBanner(res.message || 'Could not send OTP.'); return; }
      setStep(2);
    } catch (err) {
      setBanner(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    const { errors: e, isValid } = v.validate({
      otp: () => v.otp(otp),
      pw: () => v.password(pw),
      confirm: () => v.confirmPassword(confirm, pw),
    });
    setErrors(e);
    if (!isValid) return;
    setBanner('');
    setBusy(true);
    try {
      const res = await authApi.forgotPasswordReset({ phone: phone.trim(), otp: otp.trim(), newPassword: pw });
      if (res?.status === 'error') { setBanner(res.message || 'Could not reset password.'); return; }
      navigation.replace('Login');
    } catch (err) {
      setBanner(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle={step === 1 ? 'Enter your registered mobile number.' : 'Enter the OTP and choose a new password.'}
    >
      {banner ? <Text style={styles.banner}>{banner}</Text> : null}

      {step === 1 ? (
        <>
          <Input label="Mobile number" value={phone} onChangeText={setPhone} placeholder="10-digit mobile number" keyboardType="phone-pad" leftIcon="call-outline" maxLength={10} error={errors.phone} />
          <Button title="Send OTP" onPress={sendOtp} loading={busy} />
        </>
      ) : (
        <>
          <Input label="OTP" value={otp} onChangeText={setOtp} placeholder="6-digit code" keyboardType="number-pad" leftIcon="key-outline" maxLength={6} error={errors.otp} />
          <Input label="New password" value={pw} onChangeText={setPw} placeholder="At least 6 characters" secureTextEntry leftIcon="lock-closed-outline" error={errors.pw} />
          <Input label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" secureTextEntry leftIcon="lock-closed-outline" error={errors.confirm} />
          <Button title="Reset password" onPress={reset} loading={busy} />
          <Pressable onPress={() => setStep(1)} hitSlop={8} style={styles.center}>
            <Text style={styles.link}>Change number</Text>
          </Pressable>
        </>
      )}

      <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8} style={styles.center}>
        <Text style={styles.muted}>Back to sign in</Text>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.accentLight, color: colors.text, padding: spacing.md, borderRadius: 10, marginBottom: spacing.lg, fontSize: typography.small, lineHeight: 19 },
  center: { alignItems: 'center', marginTop: spacing.lg },
  link: { color: colors.primary, fontWeight: typography.semibold, fontSize: typography.small },
  muted: { color: colors.textMuted, fontSize: typography.small },
});
