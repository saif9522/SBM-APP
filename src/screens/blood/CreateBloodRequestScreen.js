import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, Header, Input, Button, ChipGroup } from '../../components';
import { spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import bloodApi from '../../api/bloodApi';
import { CHOICES } from '../../constants/endpoints';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

const URGENCY = [{ label: 'Normal', value: 'normal' }, { label: 'Urgent', value: 'urgent' }];

export default function CreateBloodRequestScreen({ navigation }) {
  const { user } = useAuth();
  const [f, setF] = useState({
    patient_name: '', phone: user?.phone || '', blood_group: '', units: '1',
    hospital: '', needed_by: '', urgency: 'normal', address: user?.address || '', attendant_name: '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setF((s) => ({ ...s, [k]: val }));

  const submit = async () => {
    const { errors: e, isValid } = v.validate({
      patient_name: () => v.required(f.patient_name, 'Patient name'),
      phone: () => v.phone(f.phone),
      blood_group: () => (f.blood_group ? '' : 'Please select blood group.'),
      hospital: () => v.required(f.hospital, 'Hospital'),
      needed_by: () => v.dateISO(f.needed_by),
    });
    setErrors(e);
    if (!isValid) return;
    setBusy(true);
    try {
      const created = await bloodApi.requests.create({
        user: user?.id || null,
        patient_name: f.patient_name.trim(),
        attendant_name: f.attendant_name.trim(),
        phone: f.phone.trim(),
        blood_group: f.blood_group,
        units: Math.max(1, parseInt(f.units, 10) || 1),
        hospital: f.hospital.trim(),
        needed_by: f.needed_by.trim() || null,
        urgency: f.urgency,
        address: f.address.trim(),
      });
      navigation.replace('BloodRequestSuccess', { request: created });
    } catch (err) {
      Alert.alert('Could not submit', friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]}>
      <Header title="Request Blood" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Input label="Patient name" value={f.patient_name} onChangeText={set('patient_name')} leftIcon="person-outline" error={errors.patient_name} />
          <Input label="Attendant name (optional)" value={f.attendant_name} onChangeText={set('attendant_name')} leftIcon="people-outline" />
          <Input label="Contact phone" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" leftIcon="call-outline" maxLength={10} error={errors.phone} />
          <ChipGroup label="Blood group" options={CHOICES.bloodGroups.map((g) => ({ label: g, value: g }))} value={f.blood_group} onChange={set('blood_group')} error={errors.blood_group} />
          <Input label="Units required" value={f.units} onChangeText={set('units')} keyboardType="number-pad" leftIcon="flask-outline" maxLength={2} />
          <Input label="Hospital" value={f.hospital} onChangeText={set('hospital')} leftIcon="medkit-outline" error={errors.hospital} />
          <Input label="Needed by (optional)" value={f.needed_by} onChangeText={set('needed_by')} placeholder="YYYY-MM-DD" leftIcon="calendar-outline" error={errors.needed_by} />
          <ChipGroup label="Urgency" options={URGENCY} value={f.urgency} onChange={set('urgency')} />
          <Input label="Address (optional)" value={f.address} onChangeText={set('address')} leftIcon="home-outline" multiline />
          <Button title="Submit request" onPress={submit} loading={busy} style={{ marginTop: spacing.md }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({ body: { padding: spacing.lg } });
