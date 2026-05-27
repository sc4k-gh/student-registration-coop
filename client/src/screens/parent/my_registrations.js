import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client.js';

export default function MyRegistrations() {
    // Fetch all registrations of the current logged in user.
    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ['registrations'],
        queryFn: () => apiClient.get('/registrations/my'),
    });
    const data = responseData?.data || [];

    // Flatten registrations from students
    const allRegistrations = data?.flatMap(student =>
    student.registrations?.map(reg => ({
        ...reg,
        student_name: student.student_name,
        student_age: student.age,
    })) || []
    ) || [];


    if (isLoading) return <View style={styles.container}><Text>Loading...</Text></View>;
    if (isError) return <View style={styles.container}><Text>Error loading registrations.</Text></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Registrations</Text>
            <FlatList
                data={allRegistrations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                <View style={styles.card}>
                    <Text style={styles.name}>{item.student_name}</Text>
                    <Text>Age: {item.student_age}</Text>
                    <Text>Program: {item.programs?.name || 'N/A'}</Text>
                    <Text>Time Slot: {item.time_slots?.day_of_week} {item.time_slots?.start_time}-{item.time_slots?.end_time}</Text>
                    <Text>Mode: {item.time_slots?.mode || 'N/A'}</Text>
                    <Text style={[
                        styles.status,
                        item.status === 'approved' && styles.statusApproved,
                        item.status === 'rejected' && styles.statusRejected,
                        item.status === 'pending' && styles.statusPending,
                    ]}>
                    Status: {item.status?.toUpperCase() || 'UNKNOWN'}
                    </Text>
                </View>
            )}
        />
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
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  statusApproved: {
    color: '#4CAF50',
  },
  statusRejected: {
    color: '#F44336',
  },
  statusPending: {
    color: '#FF9800',
  },
});