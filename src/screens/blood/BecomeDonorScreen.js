import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, Header, Input, Button, ChipGroup } from '../../components';
import { spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import bloodApi from '../../api/bloodApi';
import { CHOICES } from '../../constants/endpoints';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

const GENDERS = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }];

export default function BecomeDonorScreen({ navigation }) {
  const { user } = useAuth();
  const [f, setF] = useState({
    name: user?.name || '', gender: '', age: '', blood_group: '',
    phone: user?.phone || '', email: user?.email || '', address: user?.address || '',
    ward_no: user?.ward_no ? String(user.ward_no) : '', last_donation_date: '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setF((s) => ({ ...s, [k]: val }));

  const submit = async () => {
    const { errors: e, isValid } = v.validate({
      name: () => v.required(f.name, 'Name'),
      gender: () => (f.gender ? '' : 'Please select gender.'),
      age: () => (Number(f.age) >= 18 && Number(f.age) <= 65 ? '' : 'Age must be between 18 and 65.'),
      blood_group: () => (f.blood_group ? '' : 'Please select blood group.'),
      phone: () => v.phone(f.phone),
      address: () => v.required(f.address, 'Address'),
      last_donation_date: () => v.dateISO(f.last_donation_date),
    });
    setErrors(e);
    if (!isValid) return;
    setBusy(true);
    try {
      await bloodApi.donors.create({
        name: f.name.trim(), gender: f.gender, age: Number(f.age), blood_group: f.blood_group,
        phone: f.phone.trim(), email: f.email.trim(), address: f.address.trim(),
        ward_no: f.ward_no.trim(), last_donation_date: f.last_donation_date.trim() || null,
      });
      Alert.alert('Thank you!', 'You are registered as a blood donor.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Could not register', friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <Header title="Become a Donor" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Input label="Full name" value={f.name} onChangeText={set('name')} leftIcon="person-outline" error={errors.name} />
          <ChipGroup label="Gender" options={GENDERS} value={f.gender} onChange={set('gender')} error={errors.gender} />
          <Input label="Age" value={f.age} onChangeText={set('age')} keyboardType="number-pad" leftIcon="calendar-outline" maxLength={3} error={errors.age} />
          <ChipGroup label="Blood group" options={CHOICES.bloodGroups.map((g) => ({ label: g, value: g }))} value={f.blood_group} onChange={set('blood_group')} error={errors.blood_group} />
          <Input label="Phone" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" leftIcon="call-outline" maxLength={10} error={errors.phone} />
          <Input label="Email (optional)" value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" />
          <Input label="Address" value={f.address} onChangeText={set('address')} leftIcon="home-outline" multiline error={errors.address} />
          <Input label="Ward no. (optional)" value={f.ward_no} onChangeText={set('ward_no')} leftIcon="location-outline" />
          <Input label="Last donation date (optional)" value={f.last_donation_date} onChangeText={set('last_donation_date')} placeholder="YYYY-MM-DD" leftIcon="water-outline" error={errors.last_donation_date} />
          <Button title="Register as donor" onPress={submit} loading={busy} style={{ marginTop: spacing.md }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({ body: { padding: spacing.lg } });
