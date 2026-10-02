import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Screen, Header, Input, Button, Card, PaymentModal } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import serviceApi from '../../api/serviceApi';
import { paymentUrl } from '../../constants/config';
import { buildFormData, MULTIPART } from '../../utils/upload';
import { currency } from '../../utils/format';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

export default function ServiceApplicationScreen({ route, navigation }) {
  const { service } = route.params || {};
  const { user } = useAuth();
  const [quantity, setQuantity] = useState('1');
  const [address, setAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [createdReq, setCreatedReq] = useState(null);

  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const total = Number(service?.price || 0) * qty;

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to attach an image.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) setImage(res.assets[0]);
  };

  const submit = async () => {
    const { errors: e, isValid } = v.validate({
      address: () => v.required(address, 'Address'),
    });
    setErrors(e);
    if (!isValid) return;
    if (!user?.id) { Alert.alert('Please sign in', 'You need to be signed in to apply.'); return; }

    setBusy(true);
    try {
      // App khud ek unique request number bhejta hai, taaki backend ka
      // (buggy) auto-generation skip ho jaaye aur "Duplicate entry" error na aaye.
      const now = new Date();
      const p = (n) => String(n).padStart(2, '0');
      const datePart = `${String(now.getFullYear()).slice(2)}${p(now.getMonth() + 1)}${p(now.getDate())}`;
      const timePart = `${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
      const rand = String(Math.floor(Math.random() * 900) + 100);
      const request_no = `SR-${datePart}-${timePart}${rand}`;

      const fields = { request_no, user: user.id, service: service.id, quantity: qty, address: address.trim(), notes: notes.trim() };
      let created;
      if (image) {
        created = await serviceApi.serviceRequests.create(buildFormData(fields, { image }), MULTIPART);
      } else {
        created = await serviceApi.serviceRequests.create(fields);
      }
      // Paid service -> Razorpay (live). Free service -> straight to success.
      if (Number(service?.price || 0) > 0) {
        setCreatedReq(created);
        setPayOpen(true);
      } else {
        navigation.replace('ApplicationSuccess', { request: created, service });
      }
    } catch (err) {
      Alert.alert('Could not submit', friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const onPayClosed = async (finished) => {
    setPayOpen(false);
    let req = createdReq;
    // PaymentModal already confirmed with the server; always re-read the booking.
    if (createdReq?.id) {
      try { req = await serviceApi.serviceRequests.get(createdReq.id); } catch { /* keep */ }
    }
    navigation.replace('ApplicationSuccess', { request: req, service });
  };

  return (
    <Screen edges={[]}>
      <Header title="Apply for service" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Card style={styles.summary}>
            <Text style={styles.svcName}>{service?.name}</Text>
            <Text style={styles.svcPrice}>{currency(service?.price)}</Text>
          </Card>

          <Input label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" leftIcon="cube-outline" />
          <Input label="Service address" value={address} onChangeText={setAddress} placeholder="Where should we come?" leftIcon="location-outline" multiline error={errors.address} />
          <Input label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Anything we should know" multiline />

          <Text style={styles.attachLabel}>Attach a photo (optional)</Text>
          {image ? (
            <View style={styles.preview}>
              <Image source={{ uri: image.uri }} style={styles.previewImg} />
              <Pressable style={styles.removeBtn} onPress={() => setImage(null)}>
                <Ionicons name="close" size={16} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.attach} onPress={pickImage}>
              <Ionicons name="image-outline" size={22} color={colors.primary} />
              <Text style={styles.attachText}>Choose from gallery</Text>
            </Pressable>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated total</Text>
            <Text style={styles.totalValue}>{currency(total)}</Text>
          </View>

          <Button title={total > 0 ? `Proceed to Pay ${currency(total)}` : 'Submit application'} onPress={submit} loading={busy} style={{ marginTop: spacing.lg }} />
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <PaymentModal
        visible={payOpen}
        kind="service"
        refId={createdReq?.id}
        url={createdReq?.id ? paymentUrl('service', createdReq.id) : null}
        onClose={onPayClosed}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  svcName: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, flex: 1 },
  svcPrice: { fontSize: typography.body, fontWeight: typography.bold, color: colors.primary },
  attachLabel: { fontSize: typography.small, fontWeight: typography.medium, color: colors.textMuted, marginBottom: spacing.sm },
  attach: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.md,
    paddingVertical: spacing.lg, backgroundColor: colors.surface,
  },
  attachText: { color: colors.primary, fontWeight: typography.medium, marginLeft: spacing.sm },
  preview: { alignSelf: 'flex-start' },
  previewImg: { width: 120, height: 120, borderRadius: radius.md },
  removeBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: colors.danger, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  totalLabel: { fontSize: typography.body, color: colors.textMuted },
  totalValue: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.primary },
});
