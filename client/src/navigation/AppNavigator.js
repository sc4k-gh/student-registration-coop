import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList,
} from '@react-navigation/drawer';

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
import { useAuth } from '../auth/AuthProvider.js';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerContent(props) {
    const { signOut, user, role } = useAuth();
    return (
        <DrawerContentScrollView {...props}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                <Text style={{ fontWeight: '600' }}>{user?.email ?? ''}</Text>
                {role && <Text style={{ color: '#666', fontSize: 12 }}>{role}</Text>}
            </View>
            <DrawerItemList {...props} />
            <DrawerItem label="Sign Out" onPress={() => signOut()} />
        </DrawerContentScrollView>
    );
}

function AdminDrawer() {
    return (
        <Drawer.Navigator initialRouteName="Dashboard" drawerContent={DrawerContent}>
            <Drawer.Screen name="Dashboard" component={DashboardScreen} />
            <Drawer.Screen name="Students" component={StudentPage} />
            <Drawer.Screen name="Teachers" component={TeachersPage} />
            <Drawer.Screen name="Courses" component={CoursesPage} />
            <Drawer.Screen name="Settings" component={SettingsPage} />
        </Drawer.Navigator>
    );
}

function ParentDrawer() {
    return (
        <Drawer.Navigator initialRouteName="Register" drawerContent={DrawerContent}>
            <Drawer.Screen name="Register" component={RegistrationForm} />
            <Drawer.Screen name="MyRegistrations" component={MyRegistrations} options={{ title: 'My Registrations' }} />
        </Drawer.Navigator>
    );
}

function AuthStack() {
    return (
        <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Landing" component={LandingPage} />
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="SignUp" component={SignUpPage} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { isSignedIn, role, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {!isSignedIn ? <AuthStack /> : role === 'admin' ? <AdminDrawer /> : <ParentDrawer />}
        </NavigationContainer>
    );
}
