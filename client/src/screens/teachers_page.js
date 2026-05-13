import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export default function TeachersPage() {
    const [studentsQuery, setStudentsQuery] = React.useState('');
    const [Search, setSearch] = React.useState('');
    
    // Fetch all teachers, with their name, courses, age, and time slots, from the backend.
    const { data, isLoading, isError } = useQuery({
        queryKey: ['teachers'],
        queryFn: () => apiClient.get('/admin/teachers'),
    });

    //Fetch students studying under a given teacher
    const { data: searchData, isLoading: searchLoading, refetch } = useQuery({
        queryKey: ['studentssearch', Search],
        queryFn: () => apiClient.get(`/admin/teachers/${Search}/students`),
        enabled: !!Search,
    });

    function searchButton() {
        setSearch(studentsQuery);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Teachers</Text>
            <FlatList
                data={data}
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
                            <Text style={styles.name}>{item.name}</Text>
                            <Text>Email: {item.email}</Text>
                            <Text>Phone: {item.phone_number}</Text>
                            <Text>Courses: {programs || 'No courses assigned'}</Text>
                            <Text>Time Slots: {timeSlots || 'No time slots assigned'}</Text>
                        </View>
                    );
                }}
            />
            <Text style={styles.label}>Students studying under</Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            value={studentsQuery}
                            placeholder="Enter teacher name"
                            placeholderTextColor="#666666"
                            onChangeText={setStudentsQuery}
                          />
                        <Pressable 
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed]}
                            onPress={searchButton}>
                                <Text style={styles.buttonText}>Search</Text>
                        </Pressable>
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
    label: { fontWeight: '600', fontSize: 14 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#0a7ea4',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 50
    },
    buttonPressed: { opacity: 0.7 },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: '#fff', fontWeight: '600' },
    secondaryButtonText: { color: '#0a7ea4', fontWeight: '600' },
});
