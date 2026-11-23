import React from 'react'; // Lets this file define a React screen.
import { Alert, FlatList, Pressable, Text, View } from 'react-native'; // Imports building blocks for the screen and its scrollable list.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // Loads server data and tracks loading/error states.
import apiClient from '../api/client.js'; // Provides this app's helper for making server requests.
import { listStyles as styles } from '../styles/listStyles.js'; // Reuses the styles shared by other list screens.

export default function RegistrationsPage() {
    // Ask the server for pending registrations and keep the request state.
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-registrations'], // A label React Query uses to identify and cache this data.
        queryFn: () => apiClient.get('/admin/registrations'), // Runs the GET request that loads the registrations.
    });

    const queryClient = useQueryClient(); // Gets access to React Query's saved data.

    const reviewMutation = useMutation({ // Sets up a request that changes a registration.
        mutationFn: ({ id, status }) => // Receives the registration ID and new status.
            apiClient.patch(`/admin/registrations/${id}`, { status }), // Sends the update to the server.
        onSuccess: () => // Runs only if the server accepts the update.
            queryClient.invalidateQueries({ queryKey: ['admin-registrations'] }), // Refreshes the list so the reviewed item disappears.
    });

    const rejectRegistration = (id) => { // Creates a helper function for rejecting one registration.
        Alert.alert( // Shows a confirmation dialog.
            'Reject registration?', // The dialog title.
            'Are you sure you want to reject this registration?', // The dialog message.
            [ // The choices shown in the dialog.
                { text: 'Cancel', style: 'cancel' }, // Closes the dialog without changing anything.
                {
                    text: 'Reject', // The confirmation choice.
                    style: 'destructive', // Marks this as an action that can’t easily be undone.
                    onPress: () => reviewMutation.mutate({ id, status: 'rejected' }), // Sends the reject request when tapped.
                },
            ],
        );
    };

    // Show this message while the server request is still in progress.
    if (isLoading) {
        return <View style={styles.container}><Text>Loading registrations...</Text></View>;
    }

    // Show this message if the server request failed.
    if (isError) {
        return <View style={styles.container}><Text>Error loading registrations.</Text></View>;
    }

    // If loading succeeded, display the screen and the returned registrations.
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Registrations</Text>

            {/* Explain when saving a decision fails; the mutation error contains the server/client message. */}
            {reviewMutation.isError && (
                <Text style={{ color: '#c62828', marginBottom: 12 }}>
                    Could not update registration: {reviewMutation.error.message}
                </Text>
            )}

            {/* FlatList creates one card for each registration and shows a message when there are none. */}
            <FlatList
                data={data ?? []}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text>No pending registrations.</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.itemTitle}>
                            {item.students?.student_name ?? 'Unnamed student'} {/* Shows the name, or fallback text if missing. */}
                        </Text>
                        <Text>Age: {item.students?.age ?? 'Not specified'}</Text> {/* Shows the age, or fallback text if missing. */}
                        <Text>Parent: {item.students?.parent_name ?? 'Not provided'}</Text> {/* Shows the parent's name */}
                        <Text>Phone: {item.students?.parent_phone ?? 'Not provided'}</Text> {/* Shows the parent's phone */}
                        <Text>Program: {item.time_slots?.programs?.name ?? 'Not specified'}</Text> {/* Shows the selected program */}
                        <Text>Day: {item.time_slots?.day_of_week ?? 'Not specified'}</Text> {/* Shows the class day */}
                        <Text>
                            Time: {item.time_slots?.start_time && item.time_slots?.end_time
                                ? `${item.time_slots.start_time} - ${item.time_slots.end_time}`
                                : 'Not specified'}
                        </Text> {/* Shows the time range when both times exist. */}
                        {/* Places the buttons side by side. */}
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                            <Pressable
                                accessibilityRole="button"
                                disabled={reviewMutation.isPending} // Prevents another decision while a request is being saved.
                                onPress={() => reviewMutation.mutate({ id: item.id, status: 'approved' })} // Sends the approve update when tapped.
                            >
                                <Text>
                                    {reviewMutation.isPending
                                        && reviewMutation.variables?.id === item.id
                                        && reviewMutation.variables?.status === 'approved'
                                        ? 'Approving...'
                                        : 'Approve'}
                                </Text> {/* Shows progress for this registration, otherwise the normal button label. */}
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                disabled={reviewMutation.isPending} // Prevents another decision while a request is being saved.
                                onPress={() => rejectRegistration(item.id)} // Opens the confirmation before rejecting.
                            >
                                <Text>
                                    {reviewMutation.isPending
                                        && reviewMutation.variables?.id === item.id
                                        && reviewMutation.variables?.status === 'rejected'
                                        ? 'Rejecting...'
                                        : 'Reject'}
                                </Text> {/* Shows progress for this registration, otherwise the normal button label. */}
                            </Pressable>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}