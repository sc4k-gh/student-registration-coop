import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Dashboard</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Total Students</Text>
                <Text style={styles.cardValue}>120</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Total Teachers</Text>
                <Text style={styles.cardValue}>15</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Active Courses</Text>
                <Text style={styles.cardValue}>8</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 16,
        color: '#666',
    },
    cardValue: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 5,
    },
});
