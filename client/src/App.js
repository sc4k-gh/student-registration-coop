import 'react-native-gesture-handler'; // Required for Drawer
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import LandingPage from './screens/landing_page';
import DashboardScreen from './screens/dashboard_page';
import StudentPage from './screens/student_page';
import TeachersPage from './screens/teachers_page';
import SettingsPage from './screens/settings_page';
// import CoursesPage from './screens/courses_page'; // Deferred as per instructions

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainApp() {
  return (
    <Drawer.Navigator initialRouteName="Overview">
      <Drawer.Screen name="Overview" component={DashboardScreen} />
      <Drawer.Screen name="Students" component={StudentPage} />
      <Drawer.Screen name="Teachers" component={TeachersPage} />
      <Drawer.Screen name="Settings" component={SettingsPage} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingPage} />
        {/* 
            The Landing page navigates to "Dashboard". 
            We map "Dashboard" to our Drawer (MainApp) so the existing navigation works. 
        */}
        <Stack.Screen name="Dashboard" component={MainApp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
