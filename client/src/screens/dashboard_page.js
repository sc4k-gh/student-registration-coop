import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';

export default function DashboardScreen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'summary'],
    queryFn: () => apiClient.get('/admin/summary'),
  });

  if (isLoading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }
  if (isError) {
    return <View style={styles.container}><Text>Error loading dashboard.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Enrolled Students</Text>
        <Text style={styles.cardValue}>{data?.enrolled_count ?? '-'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pending Registrations</Text>
        <Text style={styles.cardValue}>{data?.pending_count ?? '-'}</Text>
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
        elevation: 3,
        shadowColor: '#000',
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
