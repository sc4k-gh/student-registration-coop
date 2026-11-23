
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../auth/AuthProvider.js';
import FloatingInput from '../../components/FloatingInput.js';
import {
  isValidEmail,
  isStrongEnough,
} from '../../utils/validators.js';

export default function Page() {
  const { signIn } = useAuth();
  const navigation = useNavigation();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Individual validation errors
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

  // Server error
  const [errorMessage, setErrorMessage] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setErrorMessage('');

    // Validate email and password
    const emailError = !isValidEmail(emailAddress.trim())
      ? 'Please enter a valid email address'
      : '';

    const passwordError = !isStrongEnough(password)
      ? 'Password must be at least 6 characters'
      : '';

    // Update error states
    setEmailError(emailError);
    setPasswordError(passwordError);

    // Stop if either field is invalid
    if (emailError || passwordError) {
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await signIn(emailAddress.trim(), password);

      if (error) {
        setErrorMessage(error.message);
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
      <Text style={styles.title}>Sign in</Text>

      <FloatingInput
        label="Email address"
        value={emailAddress}
        onChangeText={setEmailAddress}
        error={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {!!emailError && (
        <Text style={styles.error}>{emailError}</Text>
      )}

      <FloatingInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={passwordError}
        secureTextEntry
      />

      {!!passwordError && (
        <Text style={styles.error}>{passwordError}</Text>
      )}

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
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>

      <View style={styles.linkContainer}>
        <Text>Don't have an account? </Text>
        <Pressable onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.secondaryButtonText}>Sign up</Text>
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

  error: { color: '#d32f2f', fontSize: 12 },
});
