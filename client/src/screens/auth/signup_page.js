import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, TextInput, Text, View, Platform } from 'react-native';
import apiClient from '../../api/client.js';
import { useAuth } from '../../auth/AuthProvider.js';

export function verifySubmission(name, emailAddress, phoneNumber, password, passwordconfirm) {
    if (!name || !emailAddress || !password || !phoneNumber || !passwordconfirm) {
      return 'All fields are required';
    };
    
    if (password !== passwordconfirm) {
      return 'Both password fields must match.';
    };
    
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    };

    if (/^(\d{10}|\d{3}-\d{3}-\d{4})$/.test(phoneNumber) === false) {
      return 'Phone number must be formatted as either "xxx-xxx-xxxx" or "xxxxxxxxxx".';
    };

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress) === false) {
      return 'Invalid email formatting.';
    };
  };

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
    
    //Check for errors in submission formatting, set error message to first one found
    const validationError = verifySubmission(name, emailAddress, phoneNumber, password, passwordconfirm);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    
    //If no errors are found in formatting, error message is empty
    else {
      setErrorMessage('');
    };

    setSubmitting(true);
    const result = await apiClient.post('/auth/signup', {
      name: name,
      emailAddress: emailAddress,
      password: password,
      phone_number: phoneNumber,
    });

    if (result?.error) {
      setSubmitting(false);
      setErrorMessage(result.error);
      return;
    }
    //If no errors have been returned, try to sign in with provided credentials
    const { error: signInError } = await signIn(emailAddress, password);
    setSubmitting(false);

    //If sign in error occurs, set error message to said error, otherwise navigate to dashboard
    if (signInError) {
      setErrorMessage(signInError.message);
      return;
    }
    navigation.navigate('Dashboard');
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
        color="#000"
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
          <Text style={styles.secondaryButtonText}>Sign in</Text>
        </Pressable>
      </View>

      {Platform.OS!=='android' &&
        <View style={styles.linkContainer}>
          <Pressable onPress={() => navigation.navigate('Landing')}>
            <Text style={styles.secondaryButtonText}>Back to landing page</Text>
          </Pressable>
        </View>}
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
    color: '#000'
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
  linkContainer: { flexDirection: 'row', gap: 4, marginTop: 12, alignItems: 'center' },
  error: { color: '#d32f2f', fontSize: 12 },
});