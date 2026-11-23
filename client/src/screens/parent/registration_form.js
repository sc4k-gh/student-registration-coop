import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Pressable, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'; 
import apiClient from '../../api/client.js'; 
import { Picker } from '@react-native-picker/picker';
 
function SelectionField({ selectedValue, onValueChange, placeholder, options }) {
    const [expanded, setExpanded] = useState(false);

    if (Platform.OS !== 'web') {
        return (
            <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
                <Picker.Item label={placeholder} value="" />
                {options.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
            </Picker>
        );
    }

    const selectedOption = options.find((option) => option.value === selectedValue);

    return (
        <View>
            <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                style={styles.selectButton}
                onPress={() => setExpanded((value) => !value)}
            >
                <Text style={styles.selectValue}>{selectedOption?.label ?? placeholder}</Text>
                <Text style={styles.selectChevron}>{expanded ? '▲' : '▼'}</Text>
            </Pressable>
            {expanded && (
                <View style={styles.selectOptions}>
                    {[{ label: placeholder, value: '' }, ...options].map((option) => (
                        <Pressable
                            key={option.value || 'placeholder'}
                            accessibilityRole="button"
                            style={styles.selectOption}
                            onPress={() => {
                                onValueChange(option.value);
                                setExpanded(false);
                            }}
                        >
                            <Text style={styles.selectValue}>{option.label}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}

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

    const [submitting, setSubmitting] = useState(false);

    //Set up navigation
    const navigation = useNavigation()

    // Fetch programs locations, and time slots from the backend.
    const {
        data: programs,
        isLoading: programsLoading,
        isError: programsError,
        error: programsErrorDetails,
    } = useQuery({
        queryKey: ['programs'],
        queryFn: () => apiClient.get('/programs'),
        });
    
    const {
        data: locations,
        isLoading: locationsLoading,
        isError: locationsError,
        error: locationsErrorDetails,
    } = useQuery({
        queryKey: ['locations'],
        queryFn: () => apiClient.get('/locations'),
        });
    
        const {
            data: timeSlots,
            isLoading: timeSlotsLoading,
            isError: timeSlotsError,
            error: timeSlotsErrorDetails,
        } = useQuery({
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
        enabled:
            !!selectedProgram &&
            !!selectedMode &&
            (selectedMode !== 'in-person' || !!selectedLocation),
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

      // keyboardType is a hint, not validation — the field can still hold non-digits.
      const age = parseInt(studentAge, 10);
      if (Number.isNaN(age)) {
          alert('Please enter a valid age');
          return;
      }

      // First create the new student, then the new registration.
      setSubmitting(true);
      try {
          // Add new student data to backend:
          const studentData = await apiClient.post('/students', {
              student_name: studentName,
              student_email: studentEmail,
              student_phone: studentPhone,
              age,
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

          // Clear the form so a success can't be resubmitted as a duplicate.
          setStudentName('');
          setStudentEmail('');
          setStudentPhone('');
          setStudentAge('');
          setStudentDescription('');
          setParentName('');
          setParentEmail('');
          setParentPhone('');
          setSelectedProgram('');
          setSelectedMode('');
          setSelectedLocation('');
          setSelectedTimeSlot('');

          alert('Registration submitted successfully!');
      } catch (error) {
          alert('Error submitting registration: ' + error.message);
      } finally {
          setSubmitting(false);
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
                    placeholderTextColor= "#666666"
                />

            { /* Email */}
            <Text style={styles.label}>Student Email</Text>
                <TextInput
                    style={styles.input}
                    value={studentEmail} 
                    onChangeText={setStudentEmail}
                    placeholder="Enter student email"
                    placeholderTextColor= "#666666"
                    keyboardType="email-address"
                />
                
                {/* Phone number */}
                <Text style={styles.label}>Student Phone</Text> 
                    <TextInput
                        style={styles.input}
                        value={studentPhone}
                        onChangeText={setStudentPhone}
                        placeholder="Enter student phone"
                        placeholderTextColor= "#666666"
                        keyboardType="phone-pad"
                    />

                {/* Age */}
                <Text style={styles.label}>Age *</Text>
                    <TextInput
                        style={styles.input}
                        value={studentAge}
                        onChangeText={setStudentAge}
                        placeholder="Enter age"
                        placeholderTextColor= "#666666"
                        keyboardType="numeric"
                    />
                
                {/* Student Description (Additional Info) */}
                <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.input}
                        value={studentDescription}
                        onChangeText={setStudentDescription}
                        placeholder="Tell us about the student"
                        placeholderTextColor= "#666666"
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
                    placeholderTextColor= "#666666"
                />

            { /* Email */}
            <Text style={styles.label}>Parent Email</Text>
                <TextInput
                    style={styles.input}
                    value={parentEmail} 
                    onChangeText={setParentEmail}
                    placeholder="Enter parent email"
                    placeholderTextColor= "#666666"
                    keyboardType="email-address"
                />
                
                {/* Phone number */}
                <Text style={styles.label}>Parent Phone</Text> 
                    <TextInput
                        style={styles.input}
                        value={parentPhone}
                        onChangeText={setParentPhone}
                        placeholder="Enter parent phone"
                        placeholderTextColor= "#666666"
                        keyboardType="phone-pad"
                    />
            </View>

            { /* PROGRAM PICKER: */}
            <View style={styles.section}>
                <Text style={styles.label}>Program *</Text>
                {programsLoading ? (
                    <Text>Loading programs...</Text>
                ) : programsError ? (
                    <Text style={styles.inlineError}>
                        Could not load programs: {programsErrorDetails?.message || 'Please try again.'}
                    </Text>
                ) : !programs?.length ? (
                    <Text>No active programs are available.</Text>
                ) : (
                    <SelectionField
                        selectedValue={selectedProgram}
                        placeholder="Select a program"
                        options={programs.map((program) => ({
                            label: program.name,
                            value: program.id,
                        }))}
                        onValueChange={(itemValue) => {
                            setSelectedProgram(itemValue);
                            // The slot list is scoped to the program, so any prior pick is stale.
                            setSelectedTimeSlot('');
                        }}
                    />
                )}
            </View>

        { /* MODE PICKER: */}
        <View style={styles.section}>
            <Text style={styles.label}>Mode *</Text>
                <SelectionField
                    selectedValue={selectedMode}
                    placeholder="Select mode"
                    options={[
                        { label: 'Online', value: 'online' },
                        { label: 'In-person', value: 'in-person' },
                    ]}
                    onValueChange={(itemValue) => {
                        setSelectedMode(itemValue);
                        setSelectedLocation('');
                        setSelectedTimeSlot('');
                    }}
                />
        </View>

        { /* LOCATION PICKER (only used if mode selected is "in-person"): */}
        {selectedMode === 'in-person' && (
            <View style={styles.section}>
                    <Text style={styles.label}>Location *</Text>
                    {locationsLoading ? (
                        <Text>Loading locations...</Text>
                    ) : locationsError ? (
                        <Text style={styles.inlineError}>
                            Could not load locations: {locationsErrorDetails?.message || 'Please try again.'}
                        </Text>
                    ) : (
                        <SelectionField
                            selectedValue={selectedLocation}
                            placeholder="Select location"
                            options={(locations ?? []).map((location) => ({
                                label: location.name,
                                value: location.id,
                            }))}
                            onValueChange={(itemValue) => {
                                setSelectedLocation(itemValue);
                                setSelectedTimeSlot('');
                            }}
                        />
                    )}
            </View>
        )}

        { /* TIME SLOT PICKER: */}
        {Boolean(selectedProgram && selectedMode) && (
            <View style={styles.section}>
                <Text style={styles.label}>Time Slot *</Text>
                {selectedMode === 'in-person' && !selectedLocation ? (
                    <Text>Select a location to see available time slots.</Text>
                ) : timeSlotsLoading ? (
                    <Text>Loading time slots...</Text>
                ) : timeSlotsError ? (
                    <Text style={styles.inlineError}>
                        Could not load time slots: {timeSlotsErrorDetails?.message || 'Please try again.'}
                    </Text>
                ) : !timeSlots?.length ? (
                    <Text>No available time slots for this selection. Try another program, mode, or location.</Text>
                ) : (
                    <SelectionField
                        selectedValue={selectedTimeSlot}
                        placeholder="Select time slot"
                        options={timeSlots.map((slot) => ({
                            label: `${slot.day_of_week} ${slot.start_time}-${slot.end_time} (${slot.current_count}/${slot.max_capacity})`,
                            value: slot.id,
                        }))}
                        onValueChange={setSelectedTimeSlot}
                    />
                )}
            </View>
        )}

        {/* FORM SUBMISSION BUTTON */}
        <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}>
            <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting...' : 'Submit Registration'}
            </Text>
        </TouchableOpacity>

        {/* LANDING PAGE/RETURN BUTTON */}
        <View style={styles.linkContainer}>
            <Pressable
                onPress={() => navigation.navigate('Landing')}>
                <Text style={styles.secondaryButtonText}>Back to landing page</Text>
            </Pressable>
        </View>
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
    inlineError: {
        color: '#b00020',
    },
    selectButton: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fafafa',
    },
    selectOptions: {
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    selectOption: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectValue: {
        color: '#222',
        fontSize: 16,
    },
    selectChevron: {
        color: '#555',
        fontSize: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#fafafa',
    },
    secondaryButtonText: {
    color: '#0a7ea4',
    fontWeight: '600',
    },
    linkContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
    alignItems: 'center',
    },
    submitButton: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 30,
  },
  submitButtonDisabled: {
      opacity: 0.5,
  },
  submitButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
  },
});