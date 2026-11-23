import React from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';
import { listStyles as styles } from '../styles/listStyles.js';

export default function TeachersPage({ navigation }) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['teachers'],
        queryFn: () => apiClient.get('/admin/teachers'),
    });

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.container}>
                <Text>Error loading teachers.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Teachers</Text>

            <Button
                title="+ Add teacher"
                onPress={() => navigation.navigate('TeacherForm')}
            />

            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const programs = item.time_slots
                        ?.map(slot => slot.programs?.name)
                        .filter(Boolean)
                        .join(', ');

                    const timeSlots = item.time_slots
                        ?.map(
                            slot =>
                                `${slot.day_of_week} ${slot.start_time}-${slot.end_time}`
                        )
                        .join(', ');

                    return (
                        <View style={styles.card}>
                            <Text style={styles.itemTitle}>{item.name}</Text>
                            <Text>Email: {item.email}</Text>
                            <Text>Phone: {item.phone_number}</Text>
                            <Text>
                                Courses: {programs || 'No courses assigned'}
                            </Text>
                            <Text>
                                Time Slots: {timeSlots || 'No time slots assigned'}
                            </Text>
                        </View>
                    );
                }}
            />
        </View>
    );
}