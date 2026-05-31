import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Picker } from '@react-native-picker/picker';
import apiClient from '../../api/client.js';

// Schema-aligned with docs/architecture.md §5: students has only
// (student_name, age, parent_email, parent_phone); parent_id is set server-side.
// Registrations require (student_id, program_id, time_slot_id, first_class_date).
export default function RegistrationForm() {
    const [studentName, setStudentName] = useState('');
    const [studentAge, setStudentAge] = useState('');
    const [parentEmail, setParentEmail] = useState('');
    const [parentPhone, setParentPhone] = useState('');

    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedMode, setSelectedMode] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

    const [submitting, setSubmitting] = useState(false);

    const navigation = useNavigation();
    const queryClient = useQueryClient();

    const { data: programs, isLoading: programsLoading } = useQuery({
        queryKey: ['programs'],
        queryFn: () => apiClient.get('/programs'),
    });

    const { data: locations, isLoading: locationsLoading } = useQuery({
        queryKey: ['locations'],
        queryFn: () => apiClient.get('/locations'),
    });

    // /time-slots returns { next_date, slots } — server picks the soonest open date.
    const slotsEnabled = !!selectedProgram && !!selectedMode &&
        (selectedMode !== 'in-person' || !!selectedLocation);

    const { data: slotResponse, isLoading: timeSlotsLoading } = useQuery({
        queryKey: ['timeSlots', selectedProgram, selectedMode, selectedLocation],
        queryFn: () => {
            const params = new URLSearchParams({
                program_id: selectedProgram,
                mode: selectedMode,
                ...(selectedMode === 'in-person' && selectedLocation && { location_id: selectedLocation }),
            });
            return apiClient.get(`/time-slots?${params}`);
        },
        enabled: slotsEnabled,
    });

    const timeSlots = slotResponse?.slots ?? [];
    const firstClassDate = slotResponse?.next_date ?? null;

    const handleSubmit = async () => {
        if (submitting) return;

        if (!studentName || !studentAge || !parentEmail || !parentPhone
            || !selectedProgram || !selectedMode || !selectedTimeSlot) {
            Alert.alert('Missing fields', 'Please fill in all required fields.');
            return;
        }
        const ageNum = parseInt(studentAge, 10);
        if (!Number.isInteger(ageNum) || ageNum <= 0 || ageNum > 120) {
            Alert.alert('Invalid age', 'Age must be a positive whole number.');
            return;
        }
        if (selectedMode === 'in-person' && !selectedLocation) {
            Alert.alert('Missing location', 'Please select a location for in-person mode.');
            return;
        }
        if (!firstClassDate) {
            Alert.alert('No date available', 'No upcoming class date is available for this slot.');
            return;
        }

        setSubmitting(true);
        try {
            const student = await apiClient.post('/students', {
                student_name: studentName,
                age: ageNum,
                parent_email: parentEmail,
                parent_phone: parentPhone,
            });

            await apiClient.post('/registrations', {
                student_id: student.id,
                program_id: selectedProgram,
                time_slot_id: selectedTimeSlot,
                first_class_date: firstClassDate,
            });

            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });

            Alert.alert('Success', 'Registration submitted.', [
                { text: 'OK', onPress: () => navigation.navigate('MyRegistrations') },
            ]);
        } catch (error) {
            Alert.alert('Error', error?.error || error?.message || 'Failed to submit registration.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.header}>Student Registration</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Student Information</Text>

                <Text style={styles.label}>Student Name <Text style={styles.warninglabel}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    value={studentName}
                    onChangeText={setStudentName}
                    placeholder="Enter student name"
                    placeholderTextColor="#666666"
                />

                <Text style={styles.label}>Age <Text style={styles.warninglabel}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    value={studentAge}
                    onChangeText={setStudentAge}
                    placeholder="Enter age"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Parent Contact</Text>

                <Text style={styles.label}>Parent Email <Text style={styles.warninglabel}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    value={parentEmail}
                    onChangeText={setParentEmail}
                    placeholder="Enter parent email"
                    placeholderTextColor="#666666"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Parent Phone <Text style={styles.warninglabel}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    value={parentPhone}
                    onChangeText={setParentPhone}
                    placeholder="Enter parent phone"
                    placeholderTextColor="#666666"
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Program <Text style={styles.warninglabel}>*</Text></Text>
                {programsLoading ? (
                    <Text>Loading programs...</Text>
                ) : (
                    <Picker
                        selectedValue={selectedProgram}
                        onValueChange={(v) => {
                            setSelectedProgram(v);
                            setSelectedTimeSlot('');
                        }}>
                        <Picker.Item label="Select a program" value="" />
                        {programs?.map((p) => (
                            <Picker.Item key={p.id} label={p.name} value={p.id} />
                        ))}
                    </Picker>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Mode <Text style={styles.warninglabel}>*</Text></Text>
                <Picker
                    selectedValue={selectedMode}
                    onValueChange={(v) => {
                        setSelectedMode(v);
                        setSelectedTimeSlot('');
                        if (v !== 'in-person') setSelectedLocation('');
                    }}>
                    <Picker.Item label="Select mode" value="" />
                    <Picker.Item label="Online" value="online" />
                    <Picker.Item label="In-person" value="in-person" />
                </Picker>
            </View>

            {selectedMode === 'in-person' && (
                <View style={styles.section}>
                    <Text style={styles.label}>Location <Text style={styles.warninglabel}>*</Text></Text>
                    {locationsLoading ? (
                        <Text>Loading locations...</Text>
                    ) : (
                        <Picker
                            selectedValue={selectedLocation}
                            onValueChange={(v) => {
                                setSelectedLocation(v);
                                setSelectedTimeSlot('');
                            }}>
                            <Picker.Item label="Select location" value="" />
                            {locations?.map((l) => (
                                <Picker.Item key={l.id} label={l.name} value={l.id} />
                            ))}
                        </Picker>
                    )}
                </View>
            )}

            {slotsEnabled && (
                <View style={styles.section}>
                    <Text style={styles.label}>Time Slot <Text style={styles.warninglabel}>*</Text></Text>
                    {timeSlotsLoading ? (
                        <Text>Loading time slots...</Text>
                    ) : timeSlots.length === 0 ? (
                        <Text>No open slots in the next 14 days.</Text>
                    ) : (
                        <>
                            <Text style={styles.hint}>First class: {firstClassDate}</Text>
                            <Picker
                                selectedValue={selectedTimeSlot}
                                onValueChange={setSelectedTimeSlot}>
                                <Picker.Item label="Select time slot" value="" />
                                {timeSlots.map((slot) => (
                                    <Picker.Item
                                        key={slot.id}
                                        label={`${slot.day_of_week} ${slot.start_time}-${slot.end_time} (${slot.current_count}/${slot.max_capacity})`}
                                        value={slot.id}
                                    />
                                ))}
                            </Picker>
                        </>
                    )}
                </View>
            )}

            <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.5 }]}
                onPress={handleSubmit}
                disabled={submitting}
            >
                <Text style={styles.submitButtonText}>
                    {submitting ? 'Submitting...' : 'Submit Registration'}
                </Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 20 },
    section: {
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
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    label: { fontSize: 14, marginBottom: 5, color: '#333' },
    warninglabel: { fontSize: 14, color: '#d32f2f' },
    hint: { fontSize: 13, color: '#555', marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#fafafa',
    },
    secondaryButtonText: { color: '#0a7ea4', fontWeight: '600' },
    linkContainer: { flexDirection: 'row', gap: 4, marginTop: 12, marginBottom: 30, alignItems: 'center' },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
