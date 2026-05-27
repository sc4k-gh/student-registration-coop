import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import LandingPage from '../screens/landing_page';
import DashboardScreen from '../screens/dashboard_page';
import StudentPage from '../screens/student_page';
import TeachersPage from '../screens/teachers_page';
import SettingsPage from '../screens/settings_page';
import CoursesPage from '../screens/courses_page';
import RegistrationForm from '../screens/parent/registration_form';
import LoginPage from '../screens/auth/login_page';
import SignUpPage from '../screens/auth/signup_page';
import MyRegistrations from '../screens/parent/my_registrations';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainApp() {
    return (
        <Drawer.Navigator initialRouteName="Overview">
            <Drawer.Screen name="Overview" component={DashboardScreen} />
            <Drawer.Screen name="Students" component={StudentPage} />
            <Drawer.Screen name="Teachers" component={TeachersPage} />
            <Drawer.Screen name="Courses" component={CoursesPage} />
            <Drawer.Screen name="Settings" component={SettingsPage} />
            <Drawer.Screen name="Register New Student" component={RegistrationForm} />
            <Drawer.Screen name="My Registrations" component={MyRegistrations} />
        </Drawer.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Landing" component={LandingPage} />
                <Stack.Screen name="Dashboard" component={MainApp} />
                <Stack.Screen name="Registration" component={RegistrationForm} />
                <Stack.Screen name="Login" component={LoginPage} />
                <Stack.Screen name="SignUp" component={SignUpPage} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
