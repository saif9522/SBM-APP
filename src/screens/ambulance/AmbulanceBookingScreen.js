import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Input, Button, Card } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import serviceApi from '../../api/serviceApi';
import { getCurrentLocation } from '../../utils/location';
import { currency } from '../../utils/format';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

export default function AmbulanceBookingScreen({ route, navigation }) {
  const { service } = route.params || {};
  const { user } = useAuth();
  const [patient, setPatient] = useState('');
  const [contact, setContact] = useState(user?.phone || '');
  const [pickup, setPickup] = useState(user?.address || '');
  const [hospital, setHospital] = useState('');
  const [notes, setNotes] = useState('');
  const [gps, setGps] = useState(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const useMyLocation = async () => {
    setLocating(true);
    const res = await getCurrentLocation();
    setLocating(false);
    if (res.error) { Alert.alert('Location', 'Could not get your location. Please type it in.'); return; }
    setGps({ latitude: res.latitude, longitude: res.longitude });
    if (res.address) setPickup(res.address);
  };

  const confirm = async () => {
    const { errors: e, isValid } = v.validate({
      patient: () => v.required(patient, 'Patient name'),
      contact: () => v.phone(contact),
      pickup: () => v.required(pickup, 'Pickup location'),
    });
    setErrors(e);
    if (!isValid) return;
    if (!user?.id) { Alert.alert('Please sign in', 'Sign in to book.'); return; }

    setBusy(true);
    try {
      const detail = `Patient: ${patient.trim()} | Contact: ${contact.trim()}` +
        (hospital ? ` | Hospital: ${hospital.trim()}` : '') +
        (notes ? ` | ${notes.trim()}` : '');
      const payload = { user: user.id, service: service.id, quantity: 1, address: pickup.trim(), notes: detail };
      if (gps) { payload.gps_latitude = gps.latitude; payload.gps_longitude = gps.longitude; payload.gps_location = pickup.trim(); }
      const created = await serviceApi.serviceRequests.create(payload);
      navigation.replace('BookingSuccess', { request: created, service, kind: 'Ambulance' });
    } catch (err) {
      Alert.alert('Could not book', friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <Header title="Request ambulance" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Card style={styles.summary}>
            <Text style={styles.svcName}>{service?.name}</Text>
            <Text style={styles.svcPrice}>{currency(service?.price)}</Text>
          </Card>

          <Input label="Patient name" value={patient} onChangeText={setPatient} placeholder="Who needs help?" leftIcon="person-outline" error={errors.patient} />
          <Input label="Contact number" value={contact} onChangeText={setContact} placeholder="10-digit number" keyboardType="phone-pad" leftIcon="call-outline" maxLength={10} error={errors.contact} />

          <Pressable style={styles.locBtn} onPress={useMyLocation}>
            <Ionicons name="locate" size={18} color={colors.primary} />
            <Text style={styles.locText}>{locating ? 'Getting location…' : 'Use my current location'}</Text>
          </Pressable>
          {gps ? <Text style={styles.gpsNote}>📍 Location attached</Text> : null}

          <Input label="Pickup location" value={pickup} onChangeText={setPickup} placeholder="Where to pick up" leftIcon="navigate-outline" multiline error={errors.pickup} />
          <Input label="Hospital / drop (optional)" value={hospital} onChangeText={setHospital} placeholder="Destination hospital" leftIcon="medkit-outline" multiline />
          <Input label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Condition, landmarks, etc." multiline />

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Charge</Text>
            <Text style={styles.fareValue}>{currency(service?.price)}</Text>
          </View>

          <Button title="Confirm request" onPress={confirm} loading={busy} style={{ marginTop: spacing.lg }} />
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  svcName: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, flex: 1 },
  svcPrice: { fontSize: typography.body, fontWeight: typography.bold, color: colors.primary },
  locBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: spacing.sm, marginBottom: spacing.sm },
  locText: { marginLeft: spacing.sm, color: colors.primary, fontWeight: typography.medium, fontSize: typography.small },
  gpsNote: { color: colors.success, fontSize: typography.small, marginBottom: spacing.md },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  fareLabel: { fontSize: typography.body, color: colors.textMuted },
  fareValue: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.primary },
});
