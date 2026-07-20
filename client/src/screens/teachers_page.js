import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';
import { listStyles as styles } from '../styles/listStyles.js';

// Extracts program names from a teacher's time slots.
export function getTeacherPrograms(time_slots) {
  return time_slots?.map(slot => slot.programs?.name).filter(Boolean).join(', ') || 'No courses assigned';
}

// Extracts time slot day/time info from a teacher's time slots.
export function getTeacherTimeSlots(time_slots) {
  return time_slots?.map(slot => `${slot.day_of_week} ${slot.start_time}-${slot.end_time}`).join(', ') || 'No time slots assigned';
}

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
