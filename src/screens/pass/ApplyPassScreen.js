import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Screen, Header, Input, Button, ChipGroup } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import passApi from '../../api/passApi';
import { buildFormData, MULTIPART } from '../../utils/upload';
import { CHOICES } from '../../constants/endpoints';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

export default function ApplyPassScreen({ navigation }) {
  const { user } = useAuth();
  const [f, setF] = useState({
    pass_type: '', category: '', holder_name: user?.name || '', father_husband_name: '',
    age: '', blood_group: '', phone: user?.phone || '', email: user?.email || '',
    address: user?.address || '', duration: 'monthly',
  });
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setF((s) => ({ ...s, [k]: val }));

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed', 'Allow photo access.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) setPhoto(res.assets[0]);
  };

  const submit = async () => {
    const { errors: e, isValid } = v.validate({
      pass_type: () => (f.pass_type ? '' : 'Select pass type.'),
      category: () => (f.category ? '' : 'Select category.'),
      holder_name: () => v.required(f.holder_name, 'Holder name'),
      age: () => (Number(f.age) > 0 ? '' : 'Enter a valid age.'),
      phone: () => v.phone(f.phone),
      address: () => v.required(f.address, 'Address'),
    });
    setErrors(e);
    if (!isValid) return;
    setBusy(true);
    try {
      const fields = {
        pass_type: f.pass_type, category: f.category, holder_name: f.holder_name.trim(),
        father_husband_name: f.father_husband_name.trim(), age: Number(f.age),
        blood_group: f.blood_group, phone: f.phone.trim(), email: f.email.trim(),
        address: f.address.trim(), duration: f.duration,
      };
      let created;
      if (photo) created = await passApi.passes.create(buildFormData(fields, { photo }), MULTIPART);
      else created = await passApi.passes.create(fields);
      navigation.replace('PassSuccess', { pass: created });
    } catch (err) {
      Alert.alert('Could not submit', friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <Header title="Apply for Pass" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <ChipGroup label="Pass type" options={CHOICES.passType} value={f.pass_type} onChange={set('pass_type')} error={errors.pass_type} />
          <ChipGroup label="Category" options={CHOICES.passCategory} value={f.category} onChange={set('category')} error={errors.category} />
          <Input label="Holder name" value={f.holder_name} onChangeText={set('holder_name')} leftIcon="person-outline" error={errors.holder_name} />
          <Input label="Father / Husband name (optional)" value={f.father_husband_name} onChangeText={set('father_husband_name')} leftIcon="people-outline" />
          <Input label="Age" value={f.age} onChangeText={set('age')} keyboardType="number-pad" leftIcon="calendar-outline" maxLength={3} error={errors.age} />
          <ChipGroup label="Blood group (optional)" options={CHOICES.bloodGroups.map((g) => ({ label: g, value: g }))} value={f.blood_group} onChange={set('blood_group')} />
          <Input label="Phone" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" leftIcon="call-outline" maxLength={10} error={errors.phone} />
          <Input label="Email (optional)" value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" />
          <Input label="Address" value={f.address} onChangeText={set('address')} leftIcon="home-outline" multiline error={errors.address} />
          <ChipGroup label="Duration" options={CHOICES.passDuration} value={f.duration} onChange={set('duration')} />

          <Text style={styles.attachLabel}>Photo (optional)</Text>
          {photo ? (
            <View style={styles.preview}>
              <Image source={{ uri: photo.uri }} style={styles.previewImg} />
              <Pressable style={styles.removeBtn} onPress={() => setPhoto(null)}><Ionicons name="close" size={16} color="#fff" /></Pressable>
            </View>
          ) : (
            <Pressable style={styles.attach} onPress={pickPhoto}>
              <Ionicons name="camera-outline" size={22} color={colors.primary} />
              <Text style={styles.attachText}>Add passport photo</Text>
            </Pressable>
          )}

          <Button title="Submit application" onPress={submit} loading={busy} style={{ marginTop: spacing.lg }} />
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  attachLabel: { fontSize: typography.small, fontWeight: typography.medium, color: colors.textMuted, marginBottom: spacing.sm },
  attach: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.md, paddingVertical: spacing.lg, backgroundColor: colors.surface },
  attachText: { color: colors.primary, fontWeight: typography.medium, marginLeft: spacing.sm },
  preview: { alignSelf: 'flex-start' },
  previewImg: { width: 110, height: 130, borderRadius: radius.md },
  removeBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: colors.danger, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
});
