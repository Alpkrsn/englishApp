import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

interface QuickActionsProps {
    onAddDeck: () => void;

}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAddDeck }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={onAddDeck}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>+</Text>
                </View>
                <Text style={styles.label}>Add Deck</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.m,
        justifyContent: 'flex-start',
        gap: theme.spacing.m,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Very subtle background
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconContainer: {
        marginRight: 8,
    },
    icon: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    label: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
});
