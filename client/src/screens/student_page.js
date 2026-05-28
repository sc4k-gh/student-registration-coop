import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Picker } from '@react-native-picker/picker';
import apiClient from '../api/client.js';

//If search isn't empty, filter all results to rows that have a column equal to searchMode and a value equal to search
export const searchQuery = (table, searchTerm, searchType) => {
    if (!table || Array.isArray(table) == false) {return []};
    if (searchTerm !== '') {
        return table.filter(item => item[searchType].toLowerCase().includes(searchTerm.toLowerCase()))
    };
    return table;
};

export default function StudentPage() {
    const [studentsQuery, setStudentsQuery] = React.useState('');
    const [search, setSearch] = React.useState('');
    const [searchMode, setSearchMode] = React.useState('student_name');

    // Fetch all students, with their name, enrolled program, age, and parent contacts, from the backend.
    const { data, isLoading, isError } = useQuery({
        queryKey: ['students'],
        queryFn: () => apiClient.get('/admin/students'),
    });
    

    function searchButton() {
        setSearch(studentsQuery);
    };
    
    if (isLoading) return <View style={styles.container}><Text>Loading...</Text></View>;
    if (isError) return <View style={styles.container}><Text>Error loading students.</Text></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Search by filtering criteria</Text>
            <TextInput
                style={styles.input}
                autoCapitalize="none"
                value={studentsQuery}
                placeholder="Enter student value"
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
            <Text style={styles.label}>Change filtering criteria</Text>
            <Picker style={styles.picker}
                selectedValue={searchMode}
                onValueChange={(modeValue) => setSearchMode(modeValue)}>
                <Picker.Item label="ID" value="id"/>
                <Picker.Item label="Parent ID" value="parent_id"/>
                <Picker.Item label="Student Name" value="student_name"/>
                <Picker.Item label="Parent Name" value="parent_name"/>
            </Picker>
            <Text style={styles.header}>Students</Text>
            <FlatList
                data={searchQuery(data, search, searchMode)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.name}>{item.student_name}</Text>
                        <Text>ID: {item.id}</Text>
                        <Text>Age: {item.age}</Text>
                        <Text>Enrolled Program: {item.registrations?.[0]?.programs?.name ?? 'Not enrolled'}</Text>
                        <Text>Parent: {item.parent_name}</Text>
                        <Text>Parent ID: {item.parent_id}</Text>
                        <Text>Parent Email: {item.parent_email}</Text>
                        <Text>Parent Phone: {item.parent_phone}</Text>
                    </View>
                )}
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
    },
    label: { fontWeight: '600', fontSize: 14 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 10
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
    picker: {
        backgroundColor: 'white',
        marginBottom: 10, 
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        color: '#000',
        dropdownIconColor: '#000'
    },
});