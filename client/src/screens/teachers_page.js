import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://tqwfnyxrubhfquhlqcrs.supabase.co';
const supabaseKey = 'sb_publishable_d9231ySPJmWmh2I9XgHoFA_FTnOKyhJ';
const supabase = createClient(supabaseUrl, supabaseKey);
let userInfo = []
let formInfo = []
async function queryID() {
    return(supabase.from('users').select('*'))
}
  function handleSubmit(e) {
    e.preventDefault();
    userInfo = queryID();
    formInfo = [id.value, email.value, full_name.value, phone.value, role.value];
    console.log(formInfo);
    console.log((formInfo.email == userInfo.email));
    console.log(userInfo);
}

export default function TeachersPage() {
    return (
        <View style={styles.container}>
            <form id='formTest' onSubmit={handleSubmit}>
                <label>ID: </label>
                <input type="integer" id="id" required></input>
                <div>
                <label>Email: </label>
                <input type="text" id="email" required></input>
                </div>
                <label>Full name: </label>
                <input type="text" id="full_name" required></input>
                <div>
                <label>Phone number: </label>
                <input type="text" id="phone" required></input>
                </div>
                <label>Creation date: </label>
                <input type="text" id="created_at" required></input>
                <div>
                <label>Role: </label>
                <input type="text" id="role" required></input>
                </div>
                <input type="submit" id="Submit"></input>
            </form>
            <h1>Example Entry:</h1>
            <div>
            <h1>ID: 70865e26-852c-4769-9912-daaa83e87bae</h1>
            <h1>Email: testEmail@testing.ca</h1>
            <h1>Full name: John Doe</h1>
            <h1>Phone number: 1-111-111-1111</h1>
            <h1>Creation date: 2026-03-12 14:28:46.642138+00</h1>
            <h1>Role: Admin</h1>
            </div>
        </View>
    );
};

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
