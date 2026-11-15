
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, TextInput, Text, View } from 'react-native';
import apiClient from '../../api/client.js';
import { useAuth } from '../../auth/AuthProvider.js';
import {
  isValidEmail,
  isValidPhone,
  isStrongEnough,
} from '../../utils/validators.js';

export default function Page() {
  const { signIn } = useAuth();
  const navigation = useNavigation();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');

  // Individual validation errors
  const [nameError, setNameError] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

  // Server error
  const [errorMessage, setErrorMessage] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setErrorMessage('');

    // Validate each field
    const nameError = !name.trim()
      ? 'Name is required'
      : '';

    const emailError = !isValidEmail(emailAddress.trim())
      ? 'Please enter a valid email address'
      : '';

    const phoneError = !isValidPhone(phoneNumber)
      ? 'Phone number must contain exactly 10 digits'
      : '';

    const passwordError = !isStrongEnough(password)
      ? 'Password must be at least 6 characters'
      : '';

    // Update the error states
    setNameError(nameError);
    setEmailError(emailError);
    setPhoneError(phoneError);
    setPasswordError(passwordError);

    // Stop if any field is invalid
    if (nameError || emailError || phoneError || passwordError) {
      return;
    }

    setSubmitting(true);

    try {
      await apiClient.post('/auth/signup', {
        name: name.trim(),
        emailAddress: emailAddress.trim(),
        password,
        phone_number: phoneNumber,
      });

      const { error: signInError } = await signIn(
        emailAddress.trim(),
        password
      );

      if (signInError) {
        setErrorMessage(signInError.message);
        return;
      }

      navigation.navigate('Dashboard');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={[styles.input, nameError && styles.inputError]}
        value={name}
        placeholder="Enter your name"
        placeholderTextColor="#666666"
        onChangeText={setName}
        autoCapitalize="words"
      />
      {!!nameError && <Text style={styles.error}>{nameError}</Text>}

      <Text style={styles.label}>Email address</Text>
      <TextInput
        style={[styles.input, emailError && styles.inputError]}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        placeholderTextColor="#666666"
        onChangeText={setEmailAddress}
        keyboardType="email-address"
      />
      {!!emailError && <Text style={styles.error}>{emailError}</Text>}

      <Text style={styles.label}>Phone number</Text>
      <TextInput
        style={[styles.input, phoneError && styles.inputError]}
        value={phoneNumber}
        placeholder="Enter phone number"
        placeholderTextColor="#666666"
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      {!!phoneError && <Text style={styles.error}>{phoneError}</Text>}

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={[styles.input, passwordError && styles.inputError]}
        value={password}
        placeholder="Enter password"
        placeholderTextColor="#666666"
        secureTextEntry
        onChangeText={setPassword}
      />
      {!!passwordError && <Text style={styles.error}>{passwordError}</Text>}

      {!!errorMessage && (
        <Text style={styles.error}>{errorMessage}</Text>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          submitting && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>Sign up</Text>
      </Pressable>

      <View style={styles.linkContainer}>
        <Text>Already have an account? </Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryButtonText}>Log in</Text>
        </Pressable>
      </View>

      <View style={styles.linkContainer}>
        <Pressable onPress={() => navigation.navigate('Landing')}>
          <Text style={styles.secondaryButtonText}>
            Back to landing page
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  label: { fontWeight: '600', fontSize: 14 },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },

  inputError: {
    borderColor: '#d32f2f',
  },

  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },

  buttonPressed: { opacity: 0.7 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondaryButtonText: { color: '#0a7ea4', fontWeight: '600' },

  linkContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
    alignItems: 'center',
  },

  error: {
    color: '#d32f2f',
    fontSize: 12,
  },
});
