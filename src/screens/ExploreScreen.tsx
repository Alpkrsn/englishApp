import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { PresetDeckService, PresetDeckSummary } from '../utils/PresetDeckService';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'Explore'>;

export const ExploreScreen: React.FC<Props> = ({ navigation }) => {
    const [presets, setPresets] = useState<PresetDeckSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [importingId, setImportingId] = useState<string | null>(null);

    useEffect(() => {
        loadPresets();
    }, []);

    const loadPresets = () => {
        try {
            const data = PresetDeckService.getPresetDecks();
            setPresets(data);
        } catch (error) {
            console.error('Failed to load presets:', error);
            Alert.alert('Error', 'Failed to load preset decks.');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (preset: PresetDeckSummary) => {
        try {
            setImportingId(preset.id);
            // Simulate a small delay for better UX or if operation is too fast
            await new Promise(resolve => setTimeout(resolve, 500));
            await PresetDeckService.importPresetDeck(preset.id);

            Alert.alert(
                'Success',
                `"${preset.title}" has been added to your library!`,
                [
                    {
                        text: 'Go to Library',
                        onPress: () => navigation.navigate('Home'),
                        style: 'default',
                    },
                    {
                        text: 'Stay Here',
                        style: 'cancel',
                    },
                ]
            );
        } catch (error) {
            console.error('Import failed:', error);
            Alert.alert('Error', 'Failed to add deck to library.');
        } finally {
            setImportingId(null);
        }
    };

    const renderItem = ({ item, index }: { item: PresetDeckSummary; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={styles.card}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardCategory}>{item.category} • {item.level}</Text>
                </View>
                <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>{item.cardCount} cards</Text>
                </View>
            </View>

            <Text style={styles.cardDescription}>{item.description}</Text>

            <TouchableOpacity
                style={[styles.importButton, importingId === item.id && styles.importButtonDisabled]}
                onPress={() => handleImport(item)}
                disabled={importingId !== null}
            >
                {importingId === item.id ? (
                    <ActivityIndicator color={theme.colors.white} size="small" />
                ) : (
                    <>
                        <Ionicons name="add-circle-outline" size={20} color={theme.colors.white} style={{ marginRight: 8 }} />
                        <Text style={styles.importButtonText}>Add to Library</Text>
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={presets}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Explore Decks</Text>
                        <Text style={styles.headerSubtitle}>Discover ready-made decks to jumpstart your learning.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: theme.spacing.m,
        paddingBottom: 100, // Space for bottom navigation or FAB if needed
    },
    header: {
        marginBottom: theme.spacing.l,
    },
    headerTitle: {
        ...theme.typography.h1,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.s,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    cardCategory: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    cardBadge: {
        backgroundColor: theme.colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardBadgeText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    cardDescription: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.m,
        lineHeight: 20,
    },
    importButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: theme.borderRadius.s,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    importButtonDisabled: {
        opacity: 0.7,
    },
    importButtonText: {
        color: theme.colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
