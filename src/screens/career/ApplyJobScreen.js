import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, Header, Input, Button, ChipGroup, FilePicker, PaymentModal } from '../../components';
import { fees as fetchFees, feeText, feeRequired } from '../../api/paymentApi';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import careerApi, { EXPERIENCE } from '../../api/careerApi';
import { buildFormData, MULTIPART } from '../../utils/upload';
import { CHOICES } from '../../constants/endpoints';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

const GENDERS = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }];
const MARITAL = [{ label: 'Single', value: 'single' }, { label: 'Married', value: 'married' }, { label: 'Other', value: 'other' }];

export default function ApplyJobScreen({ route, navigation }) {
  const { position } = route.params || {};
  const { user } = useAuth();
  const [f, setF] = useState({
    first_name: '', middle_name: '', last_name: '', gender: '', marital_status: '',
    blood_group: '', email: user?.email || '', phone: user?.phone || '',
    experience: 'fresher', date_of_birth: '', highest_qualification: '',
    pin_code: '', district: '', state: '', address: user?.address || '', about: '',
  });
  const [resume, setResume] = useState(null);
  const [aadhaar, setAadhaar] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setF((s) => ({ ...s, [k]: val }));

  // Joining fee — amount comes from the server (settings.CAREER_JOINING_FEE),
  // never hardcoded in the app.
  const [fee, setFee] = useState(null);
  const [createdApp, setCreatedApp] = useState(null);
  const [payOpen, setPayOpen] = useState(false);
  useEffect(() => {
    // null = amount unknown (old backend) → fee still collected, amount shown by Razorpay.
    fetchFees().then((d) => setFee(d?.career ?? null)).catch(() => setFee(null));
  }, []);
  const feeLabel = feeText(fee);
  const needsFee = feeRequired(fee);

  const onPayClosed = async (paidByServer) => {
    setPayOpen(false);
    // Re-read the application itself — works on the old backend too, where
    // the status endpoint doesn't exist yet.
    let paid = !!paidByServer;
    if (!paid && createdApp?.id) {
      try {
        const fresh = await careerApi.applications.get(createdApp.id);
        paid = fresh?.payment_status === 'paid';
      } catch { /* keep false */ }
    }
    if (paid) {
      Alert.alert('Payment received ✅',
        `Application submitted and joining fee${feeLabel ? ` ${feeLabel}` : ''} received. The team will contact you after screening.`,
        [{ text: 'View my applications', onPress: () => navigation.replace('MyJobApplications') }]);
      return;
    }
    Alert.alert('Application saved — fee pending',
      `Your application is saved. Pay the joining fee${feeLabel ? ` ${feeLabel}` : ''} to complete it. `
      + 'If money was already debited, it will update automatically in a few minutes.',
      [
        { text: 'Pay now', onPress: () => setPayOpen(true) },
        { text: 'Pay later', style: 'cancel', onPress: () => navigation.replace('MyJobApplications') },
      ]);
  };

  const submit = async () => {
    const { errors: e, isValid } = v.validate({
      first_name: () => v.required(f.first_name, 'First name'),
      gender: () => (f.gender ? '' : 'Select gender.'),
      marital_status: () => (f.marital_status ? '' : 'Select marital status.'),
      email: () => v.email(f.email, { requiredField: true }),
      phone: () => v.phone(f.phone),
      date_of_birth: () => v.dateISO(f.date_of_birth, { requiredField: true }),
      highest_qualification: () => v.required(f.highest_qualification, 'Qualification'),
      pin_code: () => v.required(f.pin_code, 'PIN code'),
      district: () => v.required(f.district, 'District'),
      state: () => v.required(f.state, 'State'),
      address: () => v.required(f.address, 'Address'),
      resume: () => (resume ? '' : 'Resume is required.'),
      aadhaar: () => (aadhaar ? '' : 'Aadhaar document is required.'),
    });
    setErrors(e);
    if (!isValid) { Alert.alert('Please complete the form', 'Some required fields are missing.'); return; }

    setBusy(true);
    try {
      const fields = {
        user: user?.id || '', applied_position: position?.value,
        first_name: f.first_name.trim(), middle_name: f.middle_name.trim(), last_name: f.last_name.trim(),
        gender: f.gender, marital_status: f.marital_status, blood_group: f.blood_group,
        email: f.email.trim(), phone: f.phone.trim(), experience: f.experience,
        date_of_birth: f.date_of_birth.trim(), highest_qualification: f.highest_qualification.trim(),
        pin_code: f.pin_code.trim(), district: f.district.trim(), state: f.state.trim(),
        address: f.address.trim(), about: f.about.trim(),
      };
      // Retry after a failed payment must NOT create a second application.
      const created = createdApp || await careerApi.applications.create(
        buildFormData(fields, { resume, aadhaar }), MULTIPART
      );
      setCreatedApp(created);
      if (needsFee && created?.payment_status !== 'paid') {
        setPayOpen(true); // step 2: joining fee
        return;
      }
      Alert.alert('Application submitted', 'Thank you! The team will review your application.', [
        { text: 'View my applications', onPress: () => navigation.replace('MyJobApplications') },
        { text: 'Done', onPress: () => navigation.popToTop() },
      ]);
    } catch (err) {
      Alert.alert('Could not submit', friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]}>
      <Header title="Apply" subtitle={position?.label} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.section}>Personal</Text>
          <Input label="First name" value={f.first_name} onChangeText={set('first_name')} error={errors.first_name} />
          <Input label="Middle name (optional)" value={f.middle_name} onChangeText={set('middle_name')} />
          <Input label="Last name (optional)" value={f.last_name} onChangeText={set('last_name')} />
          <ChipGroup label="Gender" options={GENDERS} value={f.gender} onChange={set('gender')} error={errors.gender} />
          <ChipGroup label="Marital status" options={MARITAL} value={f.marital_status} onChange={set('marital_status')} error={errors.marital_status} />
          <ChipGroup label="Blood group (optional)" options={CHOICES.bloodGroups.map((g) => ({ label: g, value: g }))} value={f.blood_group} onChange={set('blood_group')} />
          <Input label="Date of birth" value={f.date_of_birth} onChangeText={set('date_of_birth')} placeholder="YYYY-MM-DD" error={errors.date_of_birth} />

          <Text style={styles.section}>Contact</Text>
          <Input label="Email" value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <Input label="Phone" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" maxLength={10} error={errors.phone} />
          <Input label="Address" value={f.address} onChangeText={set('address')} multiline error={errors.address} />
          <Input label="District" value={f.district} onChangeText={set('district')} error={errors.district} />
          <Input label="State" value={f.state} onChangeText={set('state')} error={errors.state} />
          <Input label="PIN code" value={f.pin_code} onChangeText={set('pin_code')} keyboardType="number-pad" maxLength={6} error={errors.pin_code} />

          <Text style={styles.section}>Professional</Text>
          <ChipGroup label="Experience" options={EXPERIENCE} value={f.experience} onChange={set('experience')} />
          <Input label="Highest qualification" value={f.highest_qualification} onChangeText={set('highest_qualification')} error={errors.highest_qualification} />
          <Input label="About you (optional)" value={f.about} onChangeText={set('about')} multiline />

          <Text style={styles.section}>Documents</Text>
          <FilePicker label="Resume / CV" value={resume} onPick={setResume} error={errors.resume} />
          <FilePicker label="Aadhaar" value={aadhaar} onPick={setAadhaar} error={errors.aadhaar} />

          {needsFee ? (
            <View style={styles.feeBox}>
              <Text style={styles.feeTitle}>Joining fee{feeLabel ? `: ${feeLabel}` : ' applies'}</Text>
              <Text style={styles.feeSub}>
                One-time, paid securely via Razorpay (UPI / card / net banking) right after you submit.
              </Text>
            </View>
          ) : null}

          <Button
            title={createdApp
              ? `Pay joining fee${feeLabel ? ` ${feeLabel}` : ''}`
              : (needsFee ? `Submit & pay${feeLabel ? ` ${feeLabel}` : ''}` : 'Submit application')}
            onPress={createdApp ? () => setPayOpen(true) : submit}
            loading={busy}
            style={{ marginTop: spacing.md }}
          />
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <PaymentModal
        visible={payOpen}
        kind="career"
        refId={createdApp?.id}
        onClose={onPayClosed}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  section: { fontSize: typography.body, fontWeight: typography.bold, color: colors.text, marginTop: spacing.md, marginBottom: spacing.md },
  feeBox: { backgroundColor: '#EEF0FF', borderRadius: 12, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: '#C7CBFA' },
  feeTitle: { fontSize: typography.body, fontWeight: typography.bold, color: '#312E81' },
  feeSub: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
});
