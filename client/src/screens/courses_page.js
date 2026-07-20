import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';
import { listStyles as styles } from '../styles/listStyles.js';

export default function CoursesPage() {
    // Fetch programs time slot counts from the backend.
    const { data, isLoading, isError } = useQuery({
        queryKey: ['programs'],
        queryFn: () => apiClient.get('/programs'),
    });

    if (isLoading) return <View style={styles.container}><Text>Loading...</Text></View>;
    if (isError) return <View style={styles.container}><Text>Error loading courses.</Text></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Courses</Text>
            <FlatList
                data={data}
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
