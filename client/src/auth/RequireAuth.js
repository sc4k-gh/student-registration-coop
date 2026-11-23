import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthProvider.js';

// Screens whose backend routes sit behind requireAuth need to wait for the stored
// session to be restored before deciding — otherwise a returning signed-in user
// briefly renders as signed out.
export default function RequireAuth({ children, requiredRole }) {
    const { isSignedIn, loading, user } = useAuth();
    const navigation = useNavigation();

    if (loading) {
        return <View style={styles.container}><Text>Loading...</Text></View>;
    }

    if (!isSignedIn) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Please sign in to continue.</Text>
                <Button title="Sign in" onPress={() => navigation.navigate('Login')} />
            </View>
        );
    }

    const userRole = user?.app_metadata?.role ?? 'parent';
    if (requiredRole && userRole !== requiredRole) {
        const targetScreen = userRole === 'admin' ? 'Dashboard' : 'Registration';
        return (
            <View style={styles.container}>
                <Text style={styles.message}>{requiredRole === 'admin' ? 'Admin access required.' : 'This section is for parents.'}</Text>
                <Button title={userRole === 'admin' ? 'Open dashboard' : 'Go to registration'} onPress={() => navigation.navigate(targetScreen)} />
            </View>
        );
    }

    return children;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: 20,
    },
    message: {
        fontSize: 16,
    },
});
