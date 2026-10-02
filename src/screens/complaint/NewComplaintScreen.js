import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Screen, Header, Input, Button, ChipGroup } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import complaintApi from '../../api/complaintApi';
import { buildFormData, MULTIPART } from '../../utils/upload';
import { getCurrentLocation } from '../../utils/location';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

// Values must match the backend Complaint.TYPE_CHOICES.
const TYPES = [
  { label: '💡 Light', value: 'light' },
  { label: '💧 Water', value: 'water' },
  { label: '🗑️ Garbage', value: 'garbage' },
  { label: '🌊 Drainage', value: 'drainage' },
  { label: '🚽 Toilet', value: 'toilet' },
  { label: '🛣️ Road', value: 'road' },
  { label: '🌃 Street Light', value: 'street_light' },
  { label: '🌳 Park', value: 'park' },
  { label: '📋 Other', value: 'other' },
];

export default function NewComplaintScreen({ navigation }) {
  const { user } = useAuth();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(user?.address || '');
  const [wardNo, setWardNo] = useState(user?.ward_no ? String(user.ward_no) : '');
  const [image, setImage] = useState(null);
  const [gps, setGps] = useState(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed', 'Allow photo access to attach an image.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) setImage(res.assets[0]);
  };

  const useMyLocation = async () => {
    setLocating(true);
    const res = await getCurrentLocation();
    setLocating(false);
    if (res.error) { Alert.alert('Location', 'Could not get your location. Please type it in.'); return; }
    setGps({ latitude: res.latitude, longitude: res.longitude });
    if (res.address) setLocation(res.address);
  };

  const submit = async () => {
    const { errors: e, isValid } = v.validate({
      type: () => (type ? '' : 'Please choose a category.'),
      description: () => v.required(description, 'Description'),
    });
    setErrors(e);
    if (!isValid) return;
    if (!user?.id) { Alert.alert('Please sign in', 'Sign in to file a complaint.'); return; }

    setBusy(true);
    try {
      const fields = {
        user: user.id, complaint_type: type, description: description.trim(),
        location: location.trim(), ward_no: wardNo.trim(),
      };
      if (gps) { fields.gps_latitude = gps.latitude; fields.gps_longitude = gps.longitude; fields.gps_location = location.trim(); }
      let created;
      if (image) created = await complaintApi.complaints.create(buildFormData(fields, { image }), MULTIPART);
      else created = await complaintApi.complaints.create(fields);
      navigation.replace('ComplaintSuccess', { complaint: created });
    } catch (err) {
      Alert.alert('Could not submit', friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]}>
      <Header title="New Complaint" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <ChipGroup label="Category" options={TYPES} value={type} onChange={setType} error={errors.type} />
          <Input label="Description" value={description} onChangeText={setDescription} placeholder="Describe the issue" multiline error={errors.description} />

          <Pressable style={styles.locBtn} onPress={useMyLocation}>
            <Ionicons name="locate" size={18} color={colors.primary} />
            <Text style={styles.locText}>{locating ? 'Getting location…' : 'Use my current location'}</Text>
          </Pressable>
          {gps ? <Text style={styles.gpsNote}>📍 Location attached</Text> : null}

          <Input label="Location" value={location} onChangeText={setLocation} placeholder="Where is the issue?" leftIcon="location-outline" multiline />
          <Input label="Ward no. (optional)" value={wardNo} onChangeText={setWardNo} leftIcon="map-outline" keyboardType="number-pad" />

          <Text style={styles.attachLabel}>Attach a photo (optional)</Text>
          {image ? (
            <View style={styles.preview}>
              <Image source={{ uri: image.uri }} style={styles.previewImg} />
              <Pressable style={styles.removeBtn} onPress={() => setImage(null)}><Ionicons name="close" size={16} color="#fff" /></Pressable>
            </View>
          ) : (
            <Pressable style={styles.attach} onPress={pickImage}>
              <Ionicons name="image-outline" size={22} color={colors.primary} />
              <Text style={styles.attachText}>Choose from gallery</Text>
            </Pressable>
          )}

          <Button title="Submit complaint" onPress={submit} loading={busy} style={{ marginTop: spacing.lg }} />
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  locBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: spacing.sm, marginBottom: spacing.sm },
  locText: { marginLeft: spacing.sm, color: colors.primary, fontWeight: typography.medium, fontSize: typography.small },
  gpsNote: { color: colors.success, fontSize: typography.small, marginBottom: spacing.md },
  attachLabel: { fontSize: typography.small, fontWeight: typography.medium, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.sm },
  attach: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.md, paddingVertical: spacing.lg, backgroundColor: colors.surface },
  attachText: { color: colors.primary, fontWeight: typography.medium, marginLeft: spacing.sm },
  preview: { alignSelf: 'flex-start' },
  previewImg: { width: 120, height: 120, borderRadius: radius.md },
  removeBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: colors.danger, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
});
