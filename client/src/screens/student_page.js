import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';
import { listStyles as styles } from '../styles/listStyles.js';

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
                        <Text style={styles.itemTitle}>{item.student_name}</Text>
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
