import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, Header, Input, Button } from '../../components';
import { spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import profileApi from '../../api/profileApi';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

/**
 * Note: the backend User model has no profile-image field, so we don't offer a
 * photo upload here (we won't fake a field the API can't store). Avatars use
 * initials instead.
 */
export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [f, setF] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    ward_no: user?.ward_no ? String(user.ward_no) : '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setF((s) => ({ ...s, [k]: val }));

  const save = async () => {
    const { errors: e, isValid } = v.validate({
      name: () => v.required(f.name, 'Full name'),
      phone: () => v.phone(f.phone),
      email: () => v.email(f.email),
    });
    setErrors(e);
    if (!isValid) return;
    if (!user?.id) return;

    setBusy(true);
    try {
      const updated = await profileApi.updateProfile(user.id, {
        name: f.name.trim(),
        phone: f.phone.trim(),
        email: f.email.trim(),
        address: f.address.trim(),
        ward_no: f.ward_no.trim(),
      });
      await updateUser(updated);
      Alert.alert('Saved', 'Your profile has been updated.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]}>
      <Header title="Edit profile" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Input label="Full name" value={f.name} onChangeText={set('name')} leftIcon="person-outline" error={errors.name} />
          <Input label="Mobile number" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" leftIcon="call-outline" maxLength={10} error={errors.phone} />
          <Input label="Email" value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" error={errors.email} />
          <Input label="Address" value={f.address} onChangeText={set('address')} leftIcon="home-outline" multiline />
          <Input label="Ward no." value={f.ward_no} onChangeText={set('ward_no')} leftIcon="location-outline" keyboardType="number-pad" />
          <Button title="Save changes" onPress={save} loading={busy} style={{ marginTop: spacing.md }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({ body: { padding: spacing.lg } });
