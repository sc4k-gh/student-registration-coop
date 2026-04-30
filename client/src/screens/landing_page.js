import React from 'react';
import { Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@clerk/expo';

export default function LandingPage() {
    const navigation = useNavigation();
    const { signOut, isSignedIn } = useAuth();

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Student App</Text>
            <Text>Thank you for using the student registration app</Text>

            <View style={{ flexDirection: 'column', margin: 20, gap: 20 }}>
                <Button
                    title="Login"
                    onPress={() => navigation.navigate("Login")}
                />
                   
                <Button
                    title="Go to Dashboard"
                    onPress={() => navigation.navigate("Dashboard")}
                />

                <Button
                    title="Register a Student"
                    onPress={() => navigation.navigate("Registration")}
                />

                <Button
                    title="Sign Out"
                    onPress={() => signOut()}
                />
            </View>
        </View>
    );
}