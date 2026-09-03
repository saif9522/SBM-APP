import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import AuthLayout from './_AuthLayout';
import { Button } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

const LEN = 6;

export default function OtpScreen({ route }) {
  const { phone, flow } = route.params || {};
  const { verifyOtp, resendOtp } = useAuth();
  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [error, setError] = useState('');
  const [banner, setBanner] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const inputs = useRef([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const code = digits.join('');

  const onChange = (val, i) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length > 1) {
      // pasted whole code
      const arr = clean.slice(0, LEN).split('');
      const next = Array(LEN).fill('');
      arr.forEach((d, idx) => (next[idx] = d));
      setDigits(next);
      inputs.current[Math.min(arr.length, LEN - 1)]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < LEN - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyPress = (e, i) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const onVerify = async () => {
    const msg = v.otp(code, LEN);
    if (msg) return setError(msg);
    setError('');
    setBanner('');
    setBusy(true);
    try {
      await verifyOtp({ phone, otp: code, flow });
      // Authenticated -> navigator switches to the app automatically.
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const onResend = async () => {
    setBanner('');
    try {
      await resendOtp({ phone, flow });
      setSeconds(30);
      setBanner('A new OTP has been sent.');
    } catch (err) {
      setBanner(friendlyError(err));
    }
  };

  return (
    <AuthLayout
      title="Verify your number"
      subtitle={`Enter the ${LEN}-digit code we sent to ${phone || 'your phone'}.`}
    >
      {banner ? <Text style={styles.banner}>{banner}</Text> : null}

      <View style={styles.otpRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(r) => (inputs.current[i] = r)}
            value={d}
            onChangeText={(val) => onChange(val, i)}
            onKeyPress={(e) => onKeyPress(e, i)}
            keyboardType="number-pad"
            maxLength={LEN}
            style={[styles.cell, d && styles.cellFilled, error && styles.cellError]}
            returnKeyType="done"
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Verify" onPress={onVerify} loading={busy} style={{ marginTop: spacing.xl }} />

      <View style={styles.resend}>
        {seconds > 0 ? (
          <Text style={styles.muted}>Resend code in {seconds}s</Text>
        ) : (
          <Pressable onPress={onResend} hitSlop={8}>
            <Text style={styles.link}>Resend OTP</Text>
          </Pressable>
        )}
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.primaryLight, color: colors.primaryDark, padding: spacing.md, borderRadius: 10, marginBottom: spacing.lg, fontSize: typography.small },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: {
    width: 48, height: 56, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface, textAlign: 'center', fontSize: typography.h2,
    fontWeight: typography.semibold, color: colors.text,
  },
  cellFilled: { borderColor: colors.primary },
  cellError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: typography.small, marginTop: spacing.md, textAlign: 'center' },
  resend: { alignItems: 'center', marginTop: spacing.xl },
  muted: { color: colors.textMuted, fontSize: typography.small },
  link: { color: colors.primary, fontWeight: typography.semibold, fontSize: typography.body },
});
