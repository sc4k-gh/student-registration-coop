import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export default function StudentPage() {
    const [studentQuery, setStudentQuery] = React.useState('');
    const [Search, setSearch] = React.useState('');

    //Heavy WIP
    // Fetch all students, with their name, enrolled program, age, and parent contacts, from the backend.
    const { data, isLoading, isError } = useQuery({
        queryKey: ['students'],
        queryFn: () => apiClient.get('/admin/students'),
    });
    
    //Fetch students studying under a given teacher
    const { data: searchData, isLoading: searchLoading, refetch } = useQuery({
        queryKey: ['studentsearch', Search],
        queryFn: () => apiClient.get(`/admin/teachers/${Search}/students`),
        enabled: !!Search,
    });
    function searchButton() {
        setSearch(studentQuery);
    }

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
        <Text style={styles.label}>Search by teacher name</Text>
            <TextInput
                style={styles.input}
                autoCapitalize="none"
                value={studentQuery}
                placeholder="Enter name"
                placeholderTextColor="#666666"
                onChangeText={setStudentQuery}
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