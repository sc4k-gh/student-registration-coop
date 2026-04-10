import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export default function DashboardScreen() {
  // Fetch students, teachers, and programs from the backend.
  // NOTE: students and teachers are currently unavailable due to incomplete backend endpoints.
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => apiClient.get('/admin/students'),
  });

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => apiClient.get('/admin/teachers'),
  });

  const { data: programs, isLoading: programsLoading, isError: programsError } = useQuery({
    queryKey: ['programs'],
    queryFn: () => apiClient.get('/programs'),
  });

  if (studentsLoading || teachersLoading || programsLoading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Students</Text>
          {/* TODO: Blocked — /admin/students endpoint has a schema error. */}
        <Text style={styles.cardValue}>-</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Teachers</Text>
        {/* TODO: Blocked — /admin/teachers endpoint is not yet implemented. */}
        <Text style={styles.cardValue}>-</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Courses</Text>
        {/* Filters programs by active status and returns the count. */}
        <Text style={styles.cardValue}>{programs?.filter(p => p.status === 'active').length ?? '—'}</Text>
      </View>
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
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 16,
        color: '#666',
    },
    cardValue: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 5,
    },
});
