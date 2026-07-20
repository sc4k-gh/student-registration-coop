import React from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LandingPage() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Student App</Text>
            <Text style={styles.subtitle}>Thank you for using the student registration app</Text>

            <View style={styles.buttons}>
                <Button title="Log In" onPress={() => navigation.navigate('Login')} />
                <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { color: '#555', marginBottom: 24, textAlign: 'center' },
    buttons: { flexDirection: 'column', gap: 20, minWidth: 200 },
});
