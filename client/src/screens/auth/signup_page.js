import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, TextInput, Text, View, TouchableOpacity } from 'react-native';
import apiClient from '../../api/client.js';
import { useAuth } from '../../auth/AuthProvider.js';

export default function Page() {
  const { signIn } = useAuth();
  const navigation = useNavigation();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordconfirm, setPasswordConfirm] = React.useState('');
  const [name, setName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setErrorMessage('');
    if (!name || !emailAddress || !password || !phoneNumber) {
      setErrorMessage('All fields are required');
      return;
    }
    
    if (password != passwordconfirm) {
      setErrorMessage('Both password fields must match.')
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/auth/signup', {
        name,
        emailAddress,
        password,
        phone_number: phoneNumber,
      });
    } catch (err) {
      setSubmitting(false);
      setErrorMessage(err?.error || err?.message || 'Signup failed');
      return;
    }

    const { error: signInError } = await signIn(emailAddress, password);
    setSubmitting(false);
    if (signInError) {
      setErrorMessage(signInError.message);
      return;
    }
    // AppNavigator swaps the stack automatically when isSignedIn flips.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        placeholder="Enter your name"
        placeholderTextColor="#666666"
        onChangeText={setName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Email address</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        placeholderTextColor="#666666"
        onChangeText={setEmailAddress}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Phone number</Text>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        placeholder="Enter phone number"
        placeholderTextColor="#666666"
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        placeholderTextColor="#666666"
        secureTextEntry
        onChangeText={setPassword}
      />
      
      <Text style={styles.label}>Confirm password</Text>
      <TextInput
        style={styles.input}
        value={passwordconfirm}
        placeholder="Enter password"
        placeholderTextColor="#666666"
        secureTextEntry
        onChangeText={setPasswordConfirm}
      />

      {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      <TouchableOpacity
        style={[styles.submitButton, submitting && {opacity: 0.5}]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Submitting...' : 'Sign Up'}
          </Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <Text>Already have an account? </Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryButtonText}>Log in</Text>
        </Pressable>
      </View>

      <View style={styles.linkContainer}>
        <Pressable onPress={() => navigation.navigate('Landing')}>
          <Text style={styles.secondaryButtonText}>Back to landing page</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
  label: { fontWeight: '600', fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonPressed: { opacity: 0.7 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondaryButtonText: { color: '#0a7ea4', fontWeight: '600' },
  linkContainer: { flexDirection: 'row', gap: 4, marginTop: 12, alignItems: 'center' },
  error: { color: '#d32f2f', fontSize: 12 },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
