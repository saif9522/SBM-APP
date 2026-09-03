import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, Header, Input, Button } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import donationApi from '../../api/donationApi';
import { currency } from '../../utils/format';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

const PRESETS = [101, 251, 501, 1100, 2100, 5100];

export default function DonationFormScreen({ navigation }) {
  const { user } = useAuth();
  const [donor, setDonor] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const amt = Number(amount);
    const { errors: e, isValid } = v.validate({
      donor: () => v.required(donor, 'Name'),
      phone: () => v.phone(phone),
      amount: () => (amt >= 1 ? '' : 'Enter a valid amount.'),
    });
    setErrors(e);
    if (!isValid) return;
    setBusy(true);
    try {
      // Create the donation record (status defaults to 'pending'), then hand
      // off to the real Razorpay checkout page on the next screen.
      const created = await donationApi.donations.create({
        donor_name: donor.trim(), phone: phone.trim(), address: address.trim(),
        ward_no: user?.ward_no || '', amount: amt, purpose: purpose.trim() || 'Support cleanliness',
      });
      navigation.replace('DonationPayment', { donation: created });
    } catch (err) {
      Alert.alert('Could not proceed', friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <Header title="Make a Donation" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Choose an amount</Text>
          <View style={styles.presets}>
            {PRESETS.map((p) => {
              const active = Number(amount) === p;
              return (
                <Pressable key={p} onPress={() => setAmount(String(p))} style={[styles.preset, active && styles.presetActive]}>
                  <Text style={[styles.presetText, active && styles.presetTextActive]}>₹{p}</Text>
                </Pressable>
              );
            })}
          </View>
          <Input label="Or enter amount (₹)" value={amount} onChangeText={setAmount} keyboardType="number-pad" leftIcon="cash-outline" error={errors.amount} />
          <Input label="Your name" value={donor} onChangeText={setDonor} leftIcon="person-outline" error={errors.donor} />
          <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon="call-outline" maxLength={10} error={errors.phone} />
          <Input label="Address (optional)" value={address} onChangeText={setAddress} leftIcon="home-outline" multiline />
          <Input label="Purpose (optional)" value={purpose} onChangeText={setPurpose} placeholder="e.g. Cleanliness drive" leftIcon="document-text-outline" />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>You will donate</Text>
            <Text style={styles.totalValue}>{currency(Number(amount) || 0)}</Text>
          </View>
          <Button title="Proceed to pay" onPress={submit} loading={busy} style={{ marginTop: spacing.lg }} />
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  label: { fontSize: typography.small, fontWeight: typography.medium, color: colors.textMuted, marginBottom: spacing.sm },
  presets: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  preset: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm, marginBottom: spacing.sm },
  presetActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  presetText: { fontSize: typography.body, color: colors.text, fontWeight: typography.medium },
  presetTextActive: { color: '#fff' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  totalLabel: { fontSize: typography.body, color: colors.textMuted },
  totalValue: { fontSize: typography.h2, fontWeight: typography.bold, color: colors.primary },
});
