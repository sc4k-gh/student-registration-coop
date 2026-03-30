import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = 'https://tezxtqtabsfxdavbmgpp.supabase.co';
const supabaseKey = 'sb_publishable_np5n2nhgYZGBDxq_QZdoUg_p8Ck5NRT';
const supabase = createClient(supabaseUrl, supabaseKey);
let userInfo = []
let formInfo = []
async function queryID() {
    return(supabase.from('users').select('*'))
}
  function handleSubmit(e) {
    e.preventDefault();
    userInfo = queryID();
    formInfo = [id.value, password_hash.value, email.value, name.value, phone_number.value, role.value];
    console.log(formInfo);
    console.log((formInfo.email == userInfo.email));
    console.log(userInfo);
}

export default function TeachersPage() {
    return (
        <View style={styles.container}>
            <form id='formTest' onSubmit={handleSubmit}>
                <div>
                    <label>ID: </label>
                    <input type="integer" id="id" required></input>
                    <label>Email: </label>
                    <input type="text" id="email" required></input>
                    <label>Password hash: </label>
                    <input type="text" id="password_hash" required></input>
                    <label>Full name: </label>
                    <input type="text" id="name" required></input>
                    <label>Phone number: </label>
                    <input type="text" id="phone_number" required></input>
                    <label>Creation date: </label>
                    <input type="text" id="role" required></input>
                    <input type="submit" id="Submit"></input>
                </div>
            </form>
            <h1>Example Entry:</h1>
            <div>
            <h1>ID: 4985daba-cb7b-49fb-a21f-9eb60c5c9f13</h1>
            <h1>Email: testEmail@testing.ca</h1>
            <h1>Full name: John Doe</h1>
            <h1>Password hash: testpassword</h1>
            <h1>Phone number: 1-111-111-1111</h1>
            <h1>Creation date: 2026-03-23 14:59:44.80399</h1>
            <h1>Role: parent</h1>
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
