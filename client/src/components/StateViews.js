import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// Show a centered spinner while a screen is loading data.
export function LoadingView() {
    return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#666" />
        </View>
    );
}

// Show an error message and let the user retry the failed request.
export function ErrorView({ message, onRetry }) {
    return (
        <View style={styles.centered}>
            <Text style={styles.errorMessage}>{message}</Text>
            <Pressable
                accessibilityRole="button"
                onPress={onRetry}
                style={styles.retryButton}
            >
                <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
        </View>
    );
}

// Show centered text when a list has no items.
export function EmptyState({ text }) {
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{text}</Text>
        </View>
    );
}

// Share the layout and text styling across all three components.
const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorMessage: {
        textAlign: 'center',
        marginBottom: 12,
    },
    retryButton: {
        padding: 8,
    },
    retryButtonText: {
        color: '#1976d2',
    },
    emptyContainer: {
        width: '100%',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        color: '#777',
        textAlign: 'center',
    },
});