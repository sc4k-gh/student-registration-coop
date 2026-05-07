import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, TextInput, Text, View, Platform } from 'react-native';
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
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>

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

      <Pressable
        style={({ pressed }) => [
          styles.button,
          (!emailAddress || !password || submitting) && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={!emailAddress || !password || submitting}
      >
        <Text style={styles.buttonText}>Sign in</Text>
      </Pressable>

      <View style={styles.linkContainer}>
        <Text>Don't have an account? </Text>
        <Pressable onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.secondaryButtonText}>Sign up</Text>
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
