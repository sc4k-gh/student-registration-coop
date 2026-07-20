import { StyleSheet } from 'react-native';

// Shared by the students / teachers / courses list screens, which render the same
// card-list layout and previously each carried their own copy of these rules.
export const listStyles = StyleSheet.create({
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
    card: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    // The per-card heading — `name` on students/teachers, `title` on courses.
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
});
