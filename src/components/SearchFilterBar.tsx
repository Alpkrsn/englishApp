import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export type SortOption = 'name' | 'cardCount' | 'lastStudied';

interface SearchFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
}) => {
    const sortOptions: { label: string; value: SortOption }[] = [
        { label: 'Name', value: 'name' },
        { label: 'Cards', value: 'cardCount' },
        { label: 'Recent', value: 'lastStudied' },
    ];

    return (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Search decks..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => onSearchChange('')}>
                        <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
            >
                {sortOptions.map((option) => {
                    const isActive = sortBy === option.value;
                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[styles.chip, isActive && styles.activeChip]}
                            onPress={() => onSortChange(option.value)}
                        >
                            <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: theme.spacing.m,
        paddingBottom: theme.spacing.s,
        gap: theme.spacing.s,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: theme.borderRadius.m,
        paddingHorizontal: theme.spacing.m,
        height: 44,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    searchIcon: {
        marginRight: theme.spacing.s,
    },
    input: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 16,
    },
    filterContainer: {
        gap: theme.spacing.s,
        paddingRight: theme.spacing.m,
    },
    chip: {
        paddingHorizontal: theme.spacing.m,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.l,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    activeChip: {
        backgroundColor: theme.colors.primary + '20', // 20% opacity
        borderColor: theme.colors.primary,
    },
    chipText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    activeChipText: {
        color: theme.colors.primary,
    },
});
