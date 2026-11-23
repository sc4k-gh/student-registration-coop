import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';
import { listStyles as styles } from '../styles/listStyles.js';
import { EmptyState, ErrorView, LoadingView } from '../components/StateViews.js';

export default function TeachersPage() {
    // Fetch all teachers, with their name, courses, age, and time slots, from the backend.
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['teachers'],
        queryFn: () => apiClient.get('/admin/teachers'),
    });

    // Use the shared views for loading and failed requests.
    if (isLoading) return <LoadingView />;
    if (isError) {
        return <ErrorView message="Error loading teachers." onRetry={refetch} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Teachers</Text>
            <FlatList
                data={data}
                // Show this message when the request succeeds but returns no teachers.
                ListEmptyComponent={<EmptyState text="No teachers yet" />}
                keyExtractor={(item) => item.id}
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
                            <Text style={styles.itemTitle}>{item.name}</Text>
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
