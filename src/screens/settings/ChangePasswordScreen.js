import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, Header, Input, Button } from '../../components';
import { spacing } from '../../constants/theme';
import * as authApi from '../../api/authApi';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

export default function ChangePasswordScreen({ navigation }) {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const { errors: e, isValid } = v.validate({
      oldPw: () => v.required(oldPw, 'Current password'),
      newPw: () => v.password(newPw),
      confirm: () => v.confirmPassword(confirm, newPw),
    });
    setErrors(e);
    if (!isValid) return;
    setBusy(true);
    try {
      await authApi.changePassword({ oldPassword: oldPw, newPassword: newPw });
      Alert.alert('Password updated', 'Your password has been changed.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Could not update', friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]}>
      <Header title="Change Password" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Input label="Current password" value={oldPw} onChangeText={setOldPw} secureTextEntry leftIcon="lock-closed-outline" error={errors.oldPw} />
          <Input label="New password" value={newPw} onChangeText={setNewPw} secureTextEntry leftIcon="lock-open-outline" error={errors.newPw} />
          <Input label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry leftIcon="lock-closed-outline" error={errors.confirm} />
          <Button title="Update password" onPress={submit} loading={busy} style={{ marginTop: spacing.md }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({ body: { padding: spacing.lg } });
