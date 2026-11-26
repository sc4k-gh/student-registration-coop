import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export default function TeacherForm({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState('');

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (teacher) =>
      apiClient.post('/admin/teachers', teacher),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['teachers'],
      });

      navigation.goBack();
    },
  });

  function handleSave() {
    if (mutation.isPending) return;

    setValidationError('');
    mutation.reset();

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setValidationError('Please enter a name.');
      return;
    }

    if (
      cleanEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      setValidationError('Please enter a valid email.');
      return;
    }

    mutation.mutate({
      name: cleanName,
      email: cleanEmail || null,
      phone_number: phone.trim() || null,
    });
  }

  const errorMessage =
    validationError || mutation.error?.message;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Teacher name"
        value={name}
        onChangeText={setName}
        editable={!mutation.isPending}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email address (optional)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!mutation.isPending}
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone number (optional)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!mutation.isPending}
      />

      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}

      <Button
        title={mutation.isPending ? 'Saving...' : 'Save teacher'}
        onPress={handleSave}
        disabled={mutation.isPending}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 18,
    fontSize: 16,
  },
  error: {
    color: '#b00020',
    marginBottom: 16,
  },
});