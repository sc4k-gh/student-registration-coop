import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, TextInput, Text, View, TouchableOpacity } from 'react-native';
import { useAuth } from '../../auth/AuthProvider.js';

export default function Page() {
  const { signIn } = useAuth();
  const navigation = useNavigation();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  
  const [showPassword, setShowPassword] = React.useState(false);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setSubmitting(true);
    const { error } = await signIn(emailAddress, password);
    setSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    // AppNavigator swaps the navigator stack automatically when isSignedIn flips.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in</Text>

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

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        placeholderTextColor="#666666"
        secureTextEntry={!showPassword}
        onChangeText={setPassword}
      />

      <View style={styles.linkContainer}>
        <Pressable onPress={() => toggleShowPassword()}>
          <Text style={styles.secondaryButtonText}>Toggle password visibility</Text>
        </Pressable>
      </View>

      {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      <TouchableOpacity
        style={[styles.submitButton, submitting && {opacity: 0.5}]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Submitting...' : 'Log In'}
          </Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <Text>Don't have an account? </Text>
        <Pressable onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.secondaryButtonText}>Sign up</Text>
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
