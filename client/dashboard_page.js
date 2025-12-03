import { StatusBar } from 'expo-status-bar';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';



export default function DashboardScreen({ navigation }) {

    const stats = {
        students: 'count',
        courses: 'count',
        teachers: 'count',
        newRegs: 'count',
    };


    const recent = [
        { type: 'Student', name: 'recent recent recent', date: '2025-11-23' },
        { type: 'Course', name: 'recent recent recent', date: '2025-11-22' },
        { type: 'Teacher', name: 'recent recent recent', date: '2025-11-21' },
    ];


    return (
        <View style={styles.container}>
            <View>
                <View style={styles.topBar}>
                    <TouchableOpacity>
                        <Ionicons name="menu" size={24} color="#222" />
                    </TouchableOpacity>


                    <View style={styles.headerLeft}>
                        <Text style={styles.welcome}>Welcome, Admin Name</Text>
                    </View>
                </View>


                {/* Summary cards */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summary}>
                        <Text style={styles.summaryLabel}>Total Students</Text>
                        <Text style={styles.summaryNumber}>{stats.students}</Text>
                    </View>
                    <View style={styles.summary}>
                        <Text style={styles.summaryLabel}>Total Courses</Text>
                        <Text style={styles.summaryNumber}>{stats.courses}</Text>
                    </View>
                    <View style={styles.summary}>
                        <Text style={styles.summaryLabel}>Total Teachers</Text>
                        <Text style={styles.summaryNumber}>{stats.teachers}</Text>
                    </View>
                    <View style={styles.summary}>
                        <Text style={styles.summaryLabel}>New Registrations</Text>
                        <Text style={styles.summaryNumber}>{stats.newRegs}</Text>
                    </View>
                </View>


                {/* Quick Actions */}
                <View style={styles.actionsCard}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsWrap}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                        //</View>onPress={() => navigation.navigate('AddStudent')}
                        >
                            <Text style={styles.actionText}>Add Student</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionBtn}
                        //</View>onPress={() => navigation.navigate('AddCourse')}
                        >
                            <Text style={styles.actionText}>Add Course</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionBtn}
                        //</View>onPress={() => navigation.navigate('AddTeacher')}
                        >
                            <Text style={styles.actionText}>Add Teacher</Text>
                        </TouchableOpacity>
                    </View>
                </View>


                {/* Recent Activity */}
                <View style={styles.recentCard}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>


                    {/* Table header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableCol}>Type</Text>
                        <Text style={styles.tableCol}>Name</Text>
                        <Text style={styles.tableCol}>Date Added</Text>
                        <Text style={styles.tableCol}>Action</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F3F6F8',
        paddingHorizontal: 15,
    },


    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    welcome: {
        fontSize: 20,
        fontWeight: 'bold',
    },


    summaryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },


    summary: {
        backgroundColor: '#fff',
        padding: 12,
        width: '48%',
        marginBottom: 12,
    },


    summaryLabel: {
        fontSize: 14,
        color: '#333',
    },


    summaryNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 4,
    },


    actionsCard: {
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 16,
    },


    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },


    actionsWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },


    actionBtn: {
        backgroundColor: '#eee',
        padding: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    actionText: { fontSize: 14, fontWeight: 'bold' },


    recentCard: { backgroundColor: '#fff', padding: 12 },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        backgroundColor: '#eee',
        fontWeight: 'bold',
        justifyContent: 'space-evenly',
    },
    tableCol: { fontSize: 14, color: '#111', fontWeight: 'bold' },
});





