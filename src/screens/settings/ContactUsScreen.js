import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Input, Button, Card } from '../../components';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import contactApi from '../../api/contactApi';
import * as v from '../../validation/validators';
import { friendlyError } from '../../utils/apiHelpers';

export default function ContactUsScreen({ navigation }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const { errors: e, isValid } = v.validate({
      name: () => v.required(name, 'Name'),
      message: () => v.required(message, 'Message'),
      email: () => v.email(email),
    });
    setErrors(e);
    if (!isValid) return;
    setBusy(true);
    try {
      await contactApi.sendMessage({ name: name.trim(), phone: phone.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });
      Alert.alert('Message sent', 'Thank you for reaching out. We will get back to you.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Could not send', friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <Header title="Contact Us" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Card style={styles.hero}>
            <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
            <Text style={styles.heroText}>Have a question or feedback? Send us a message and we'll respond soon.</Text>
          </Card>

          <Input label="Name" value={name} onChangeText={setName} leftIcon="person-outline" error={errors.name} />
          <Input label="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon="call-outline" maxLength={10} />
          <Input label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" error={errors.email} />
          <Input label="Subject (optional)" value={subject} onChangeText={setSubject} leftIcon="text-outline" />
          <Input label="Message" value={message} onChangeText={setMessage} placeholder="How can we help?" multiline error={errors.message} />

          <Button title="Send message" onPress={submit} loading={busy} style={{ marginTop: spacing.md }} />
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, marginBottom: spacing.lg },
  heroText: { flex: 1, marginLeft: spacing.md, color: colors.primaryDark, fontSize: typography.small, lineHeight: 20 },
});
