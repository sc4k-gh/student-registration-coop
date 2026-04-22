import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query'; 
import apiClient from '../../api/client.js'; 
import { Picker } from '@react-native-picker/picker';
 
export default function RegistrationForm() {
    /* Set up all form content via useState(). */
    // Student Information:
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentPhone, setStudentPhone] = useState('');
    const [studentAge, setStudentAge] = useState('');
    const [studentDescription, setStudentDescription] = useState('');
    
    // Parent Information:
    const [parentName, setParentName] = useState('');
    const [parentEmail, setParentEmail] = useState(''); 
    const [parentPhone, setParentPhone] = useState('');
    
    // Program Selection:
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedMode, setSelectedMode] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

    // Fetch programs locations, and time slots from the backend.
    const { data: programs, isLoading: programsLoading } = useQuery({
        queryKey: ['programs'],
        queryFn: () => apiClient.get('/programs'),
        });
    
    const { data: locations, isLoading: locationsLoading } = useQuery({
        queryKey: ['locations'],
        queryFn: () => apiClient.get('/locations'),
        });
    
        const { data: timeSlots, isLoading: timeSlotsLoading } = useQuery({
            queryKey: ['timeSlots', selectedProgram, selectedMode, selectedLocation],
            queryFn: async () => {
                const params = new URLSearchParams({
                    program_id: selectedProgram,
                    mode: selectedMode,
                    ...(selectedMode === 'in-person' && selectedLocation && { location_id: selectedLocation })
                });
                const result = await apiClient.get(`/time-slots?${params}`);
                return result; 
        },
        // Fetching for time slots is enabled only when we already have program and mode.
        enabled: !!selectedProgram && !!selectedMode,
    });

    const handleSubmit = async () => {
      // Validate required fields; if any are empty, don't accept the submission.
      if (!studentName 
        || !studentAge 
        || !parentName 
        || !parentEmail 
        || !parentPhone 
        || !selectedProgram 
        || !selectedMode 
        ||!selectedTimeSlot) {
          alert('Please fill in all required fields');
          return;
      }
      if (selectedMode === 'in-person' && !selectedLocation) {
          alert('Please select a location for in-person mode');
          return;
      }

      // First create the new student, then the new registration.
      try {
          // Add new student data to backend:
          const studentData = await apiClient.post('/students', {
              student_name: studentName,
              student_email: studentEmail,
              student_phone: studentPhone,
              age: parseInt(studentAge),
              description: studentDescription,
              parent_name: parentName,
              parent_email: parentEmail,
              parent_phone: parentPhone,
          });

          // Add new registration data to backend:
          await apiClient.post('/registrations', {
              student_id: studentData.id,
              program_id: selectedProgram,
              time_slot_id: selectedTimeSlot,
          });

          alert('Registration submitted successfully!');
          // Navigate back or clear form
      } catch (error) {
          alert('Error submitting registration: ' + error.message);
      }
  };
        

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Student Registration</Text>
            
            {/* STUDENT INFORMATION SECTION: */}
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Student Information</Text>

            {/* Name */}
            <Text style={styles.label}>Student Name *</Text>
                <TextInput
                    style={styles.input}
                    value={studentName}
                    onChangeText={setStudentName}
                    placeholder="Enter student name"
                />

            { /* Email */}
            <Text style={styles.label}>Student Email</Text>
                <TextInput
                    style={styles.input}
                    value={studentEmail} 
                    onChangeText={setStudentEmail}
                    placeholder="Enter student email"
                    keyboardType="email-address"
                />
                
                {/* Phone number */}
                <Text style={styles.label}>Student Phone</Text> 
                    <TextInput
                        style={styles.input}
                        value={studentPhone}
                        onChangeText={setStudentPhone}
                        placeholder="Enter student phone"
                        keyboardType="phone-pad"
                    />

                {/* Age */}
                <Text style={styles.label}>Age *</Text>
                    <TextInput
                        style={styles.input}
                        value={studentAge}
                        onChangeText={setStudentAge}
                        placeholder="Enter age"
                        keyboardType="numeric"
                    />
                
                {/* Student Description (Additional Info) */}
                <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.input}
                        value={studentDescription}
                        onChangeText={setStudentDescription}
                        placeholder="Tell us about the student"
                        multiline 
                        numberOfLines={3}
                    />
            </View>
                    
            
            {/* PARENT INFORMATION SECTION: */}
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parent Information</Text>

            {/* Name */}
            <Text style={styles.label}>Parent Name *</Text>
                <TextInput
                    style={styles.input}
                    value={parentName}
                    onChangeText={setParentName}
                    placeholder="Enter parent name"
                />

            { /* Email */}
            <Text style={styles.label}>Parent Email</Text>
                <TextInput
                    style={styles.input}
                    value={parentEmail} 
                    onChangeText={setParentEmail}
                    placeholder="Enter parent email"
                    keyboardType="email-address"
                />
                
                {/* Phone number */}
                <Text style={styles.label}>Parent Phone</Text> 
                    <TextInput
                        style={styles.input}
                        value={parentPhone}
                        onChangeText={setParentPhone}
                        placeholder="Enter parent phone"
                        keyboardType="phone-pad"
                    />
            </View>

            { /* PROGRAM PICKER: */}
            <View style={styles.section}>
                <Text style={styles.label}>Program *</Text>
                {programsLoading ? (
                    <Text>Loading programs...</Text>
                ) : (
                    <Picker
                        selectedValue={selectedProgram}
                        onValueChange={(itemValue) => setSelectedProgram(itemValue)}>
                        <Picker.Item label="Select a program" value="" />
                        {programs?.map((program) => (
                            <Picker.Item
                                key={program.id}
                                label={program.name}
                                value={program.id}
                            />
                        ))}
                    </Picker>
                )}
            </View>

        { /* MODE PICKER: */}
        <View style={styles.section}>
            <Text style={styles.label}>Mode *</Text>
                <Picker
                    selectedValue={selectedMode}
                    onValueChange={(itemValue) => setSelectedMode(itemValue)}>
                    <Picker.Item label="Select mode" value="" />
                    <Picker.Item label="Online" value="online" />
                    <Picker.Item label="In-person" value="in-person" />
                </Picker>
        </View>

        { /* LOCATION PICKER (only used if mode selected is "in-person"): */}
        {selectedMode === 'in-person' && (
            <View style={styles.section}>
                    <Text style={styles.label}>Location *</Text>
                    <Picker
                        selectedValue={selectedLocation}
                        onValueChange={(itemValue) => setSelectedLocation(itemValue)}>
                        <Picker.Item label="Select location" value="" />
                        {locations?.map((location) => (
                            <Picker.Item
                                key={location.id}
                                label={location.name}
                                value={location.id}
                            />
                        ))}
                    </Picker>
            </View>
        )}

        { /* TIME SLOT PICKER: */}
        {selectedProgram && selectedMode && (
            <View style={styles.section}>
                <Text style={styles.label}>Time Slot *</Text>
                {timeSlotsLoading ? (
                    <Text>Loading time slots...</Text>
                ) : (
                    <Picker
                        selectedValue={selectedTimeSlot}
                        onValueChange={(itemValue) => setSelectedTimeSlot(itemValue)}>
                        <Picker.Item label="Select time slot" value="" />
                        {timeSlots?.map((slot) => (
                            <Picker.Item
                                key={slot.id}
                                label={`${slot.day_of_week} ${slot.start_time}-${slot.end_time} (${slot.current_count}/${slot.max_capacity})`}
                                value={slot.id}
                            />
                        ))}
                    </Picker>
                )}
            </View>
        )}

        {/* FORM SUBMISSION BUTTON */}
        <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Registration</Text>
        </TouchableOpacity>

        </ScrollView>
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#fafafa',
    },
    submitButton: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 30,
  },
  submitButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
  },
});