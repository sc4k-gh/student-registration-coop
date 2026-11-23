import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';
import { listStyles as styles } from '../styles/listStyles.js';
import { EmptyState, ErrorView, LoadingView } from '../components/StateViews.js';

export default function CoursesPage() {
    // Fetch programs time slot counts from the backend.
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['programs'],
        queryFn: () => apiClient.get('/programs'),
    });

    // Use the shared views for loading and failed requests.
    if (isLoading) return <LoadingView />;
    if (isError) {
        return <ErrorView message="Error loading courses." onRetry={refetch} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Courses</Text>
            <FlatList
                data={data}
                // Show this message when the request succeeds but returns no courses.
                ListEmptyComponent={<EmptyState text="No courses yet" />}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const slotInfo = item.time_slots
                        ?.map(slot => {
                            const isFull = slot.current_count >= slot.max_capacity;
                            return `${slot.current_count}/${slot.max_capacity}${isFull ? ' (full)' : ''}`;
                        })
                        .join(', ');

                    return (
                        <View style={styles.card}>
                            <Text style={styles.itemTitle}>{item.name}</Text>
                            <Text>Level: {item.level}</Text>
                            <Text>Age Range: {item.target_age}</Text>
                            <Text>Status: {item.status}</Text>
                            <Text>Description: {item.description}</Text>
                            <Text>Time Slots: {slotInfo || 'No slots assigned'}</Text>
                        </View>
                    );
                }}
            />
        </View>
    );
}
