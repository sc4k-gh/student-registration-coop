// import { StatusBar } from 'expo-status-bar'
// import { Stylesheet, Text, View } from 'react-native'
// import {
//     createStaticNavigation,
//     useNavigation,
// } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { Button } from '@react-navigation/elements';
// import DashboardScreen from './dashboard_page';


// export default function landingPage() {
//     const navigation = useNavigation();


//     return (
//         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//             <Text>Student App</Text>
//             <Text>Thank you for using student registration app</Text>
//             <Button onPress={() => navigation.navigate(DashboardScreen)}>
//                 Go to Details
//             </Button>
//         </View>
//     );

// }

// const styles = Stylesheet.create({
//     container: {
//         backgroudColor: '#fff',
//         alignItems: 'center',
//         justifyContent: 'center',

//     }
// })

import React from 'react';
import { Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LandingPage() {
    const navigation = useNavigation();

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Student App</Text>
            <Text>Thank you for using the student registration app</Text>

            <Button
                title="Go to Dashboard"
                onPress={() => navigation.navigate("Dashboard")}
            />

            {/* <Button
                title="Go to Students"
                onPress={() => navigation.navigate("Dashboard")}
            /> */}
        </View>
    );
}