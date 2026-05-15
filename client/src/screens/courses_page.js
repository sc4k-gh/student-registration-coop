import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export default function CoursesPage() {
    const [studentsQuery, setStudentsQuery] = React.useState('');
    const [Search, setSearch] = React.useState('');

    // Fetch programs time slot counts from the backend.
    const { data, isLoading, isError } = useQuery({
        queryKey: ['programs'],
        queryFn: () => apiClient.get('/programs'),
    });
        
    const searchQuery = () => {
        if (!data) return [];
        if (Search !== '')
            return data.filter(item => item.name.toLowerCase().includes(Search.toLowerCase()));
        return data;
    };

    function searchButton() {
        setSearch(studentsQuery);
    };

    if (isLoading) return <View style={styles.container}><Text>Loading...</Text></View>;
    if (isError) return <View style={styles.container}><Text>Error loading courses.</Text></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Search by course name</Text>
                <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    value={studentsQuery}
                    placeholder="Enter course name"
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
            <Text style={styles.header}>Courses</Text>
            <FlatList
                data={searchQuery()}
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
                            <Text style={styles.title}>{item.name}</Text>
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
    title: {
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
        marginBottom: 8
    },
    buttonPressed: { opacity: 0.7 },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: '#fff', fontWeight: '600' },
    secondaryButtonText: { color: '#0a7ea4', fontWeight: '600' },
});