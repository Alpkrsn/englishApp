import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

export const TopBar: React.FC<NativeStackHeaderProps> = ({ navigation, route, options, back }) => {
    const { colors } = useTheme();
    const title = options.title ?? route.name;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Left Action (Back Button) */}
                <View style={styles.leftContainer}>
                    {back ? (
                        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.primaryNeon} />
                        </TouchableOpacity>
                    ) : (
                        // Placeholder for alignment if needed, or Logo for Home
                        route.name === 'Home' && (
                            <View />
                        )
                    )}
                </View>

                {/* Center Title */}
                <View style={styles.centerContainer}>
                    <Animated.Text entering={FadeIn.duration(300)} style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                        {title}
                    </Animated.Text>
                </View>

                {/* Right Action (Settings, etc.) */}
                <View style={styles.rightContainer}>
                    {route.name === 'Home' && (
                        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                            <Ionicons name="settings-outline" size={24} color={colors.primaryNeon} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Neon Underline */}
                <View style={[styles.neonLine, { backgroundColor: colors.primaryNeon, shadowColor: colors.primaryNeon }]} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        backgroundColor: theme.colors.background,
        position: 'relative',
    },
    leftContainer: {
        width: 40,
        alignItems: 'flex-start',
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightContainer: {
        width: 40,
        alignItems: 'flex-end',
    },
    backButton: {
        padding: 4,
    },
    title: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    neonLine: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1.5,
        backgroundColor: theme.colors.primaryNeon,
        shadowColor: theme.colors.primaryNeon,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
    },
});
