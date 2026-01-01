import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Image } from 'react-native';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { version } from '../../package.json';

import { useTheme } from '../context/ThemeContext';

export const SettingsScreen: React.FC = () => {
    const { colors, isDarkMode, toggleTheme } = useTheme();

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>

                {/* Theme Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
                    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(76, 139, 245, 0.1)' : 'rgba(76, 139, 245, 0.2)' }]}>
                                <Ionicons name={isDarkMode ? "moon-outline" : "sunny-outline"} size={24} color={colors.primary} />
                            </View>
                            <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#767577', true: colors.primary }}
                            thumbColor={isDarkMode ? colors.white : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleTheme}
                            value={isDarkMode}
                        />
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>

                    <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        {/* App Icon / Logo Placeholder */}
                        <View style={styles.logoContainer}>
                            <Ionicons name="school" size={60} color={colors.primaryNeon} />
                        </View>

                        <Text style={[styles.appName, { color: colors.text }]}>LinguApp</Text>
                        <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version {version}</Text>

                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            The best way to master new vocabulary with spaced repetition and interactive flashcards.
                        </Text>
                    </View>

                    {/* Additional Links (Placeholders) */}
                    <TouchableOpacity style={styles.linkRow}>
                        <Text style={[styles.linkText, { color: colors.text }]}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={[styles.divider, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                    <TouchableOpacity style={styles.linkRow}>
                        <Text style={[styles.linkText, { color: colors.text }]}>Terms of Service</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.m,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.h2,
        color: theme.colors.text,
        marginBottom: theme.spacing.m,
        marginLeft: theme.spacing.xs,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(76, 139, 245, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    rowLabel: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '500',
    },
    aboutCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.l,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: theme.spacing.m,
    },
    logoContainer: {
        marginBottom: theme.spacing.m,
        shadowColor: theme.colors.primaryNeon,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    appName: {
        ...theme.typography.h1,
        color: theme.colors.white,
        marginBottom: theme.spacing.xs,
    },
    versionText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.m,
    },
    description: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.s,
    },
    linkText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: theme.spacing.s,
    },
});
