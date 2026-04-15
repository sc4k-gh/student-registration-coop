import React from 'react';
import { Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LandingPage() {
    const navigation = useNavigation();

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Student App</Text>
            <Text>Thank you for using the student registration app</Text>

            <Button
                title="Go to Dashboard"
                onPress={() => navigation.navigate("Dashboard")}
            />
        </View>
    );
}