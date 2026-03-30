import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function StudentPage() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Student Page</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});