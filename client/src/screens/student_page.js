import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
const { createClient } = require('@supabase/supabase-js');
 
const supabaseUrl = 'https://tqwfnyxrubhfquhlqcrs.supabase.co';
const supabaseKey = 'sb_publishable_d9231ySPJmWmh2I9XgHoFA_FTnOKyhJ';
const supabase = createClient(supabaseUrl, supabaseKey);
async function queryID() {
    return(supabase.from('users').select('*'))
}
export default function StudentPage() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Student Page</Text>
            <Button title="Go to Dashboard" onPress={() => console.log(queryID())} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
