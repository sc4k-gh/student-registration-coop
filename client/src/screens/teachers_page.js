import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export default function TeachersPage() {
    // Fetch all teachers, with their name, courses, age, and time slots, from the backend.
    const { data, isLoading, isError } = useQuery({
        queryKey: ['teachers'],
        queryFn: () => apiClient.get('/admin/teachers'),
    });

    if (isLoading) return <View style={styles.container}><Text>Loading...</Text></View>;
    if (isError) return <View style={styles.container}><Text>Error loading teachers.</Text></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Teachers</Text>
            <FlatList
                data={data?.data ?? []}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => {
                    const programs = item.time_slots
                        ?.map(slot => slot.programs?.name)
                        .filter(Boolean)
                        .join(', ');

                    const timeSlots = item.time_slots
                        ?.map(slot => `${slot.day_of_week} ${slot.start_time}-${slot.end_time}`)
                        .join(', ');
                    
                    return (
                        <View style={styles.card}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text>Email: {item.email}</Text>
                            <Text>Phone: {item.phone_number}</Text>
                            <Text>Courses: {programs || 'No courses assigned'}</Text>
                            <Text>Time Slots: {timeSlots || 'No time slots assigned'}</Text>
                        </View>
                    );
                }}
            />
        </View>
    );
};

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
        marginBottom: 5,
    },
});
