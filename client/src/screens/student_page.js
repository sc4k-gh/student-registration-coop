import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export default function StudentPage() {
    // Fetch all students, with their name, enrolled program, age, and parent contacts, from the backend.
    const { data, isLoading, isError } = useQuery({
        queryKey: ['students'],
        queryFn: () => apiClient.get('/admin/students'),
    });

    if (isLoading) return <View style={styles.container}><Text>Loading...</Text></View>;
    if (isError) return <View style={styles.container}><Text>Error loading students.</Text></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Students</Text>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.name}>{item.student_name}</Text>
                        <Text>Age: {item.age}</Text>
                        <Text>Enrolled Program: {item.registrations?.[0]?.programs?.name ?? 'Not enrolled'}</Text>
                        <Text>Parent: {item.parent_name}</Text>
                        <Text>Parent Email: {item.parent_email}</Text>
                        <Text>Parent Phone: {item.parent_phone}</Text>
                    </View>
                )}
            />
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
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});