
import React from 'react';
import { Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthProvider.js';

export default function LandingPage() {
    const navigation = useNavigation();
    const { signOut, isSignedIn, role } = useAuth();

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Student App</Text>
            <Text>Thank you for using the student registration app</Text>

            <View style={{ flexDirection: 'column', margin: 20, gap: 20 }}>
                {!isSignedIn && (
                    <Button
                        title="Login"
                        onPress={() => navigation.navigate("Login")}
                    />
                )}

                {role === 'admin' && (
                    <Button
                        title="Go to Dashboard"
                        onPress={() => navigation.navigate("Dashboard")}
                    />
                )}

                {role !== 'admin' && (
                    <Button
                        title="Register a Student"
                        onPress={() => navigation.navigate("Registration")}
                    />
                )}

                {isSignedIn && (
                    <Button
                        title="Sign Out"
                        onPress={() => signOut()}
                    />
                )}
            </View>
        </View>
    );
}
