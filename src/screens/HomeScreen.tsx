import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Deck } from '../types';
import { StorageService } from '../utils/StorageService';
import { theme } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { Canvas, Rect, LinearGradient, vec } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';
import { DeckCard } from '../components/DeckCard';
import { EmptyState } from '../components/EmptyState';
import { SearchFilterBar, SortOption } from '../components/SearchFilterBar';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('lastStudied');
    const [refreshing, setRefreshing] = useState(false);
    const fabScale = useSharedValue(1);
    const [menuVisible, setMenuVisible] = useState(false);
    const menuAnim = useSharedValue(0);

    useEffect(() => {
        fabScale.value = withRepeat(withSequence(withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }), withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })), -1, true);
    }, []);

    const fabStyle = useAnimatedStyle(() => ({ transform: [{ scale: fabScale.value }] }));

    const toggleMenu = () => {
        if (menuVisible) {
            menuAnim.value = withTiming(0, { duration: 200 }, () => {
                runOnJS(setMenuVisible)(false);
            });
        } else {
            setMenuVisible(true);
            menuAnim.value = withTiming(1, { duration: 200 });
        }
    };

    const menuAnimatedStyle = useAnimatedStyle(() => ({
        opacity: menuAnim.value,
        transform: [{ scale: 0.9 + (menuAnim.value * 0.1) }]
    }));

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
        opacity: menuAnim.value * 1 // Max opacity handled by bg color alpha
    }));

    const loadDecks = async () => {
        const allDecks = await StorageService.getDecks();
        setDecks(allDecks);
    };

    useEffect(() => {
        let result = [...decks];

        // Filter
        if (searchQuery) {
            result = result.filter(d =>
                d.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'cardCount':
                    return (b.cards?.length || 0) - (a.cards?.length || 0);
                case 'lastStudied':
                    return (b.lastStudiedAt || 0) - (a.lastStudiedAt || 0);
                default:
                    return 0;
            }
        });

        setFilteredDecks(result);
    }, [decks, searchQuery, sortBy]);

    useFocusEffect(useCallback(() => { loadDecks(); }, []));

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDecks();
        setRefreshing(false);
    };

    const renderItem = ({ item, index }: { item: Deck, index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
            <DeckCard deck={item} index={index} onPress={() => navigation.navigate('DeckDetail', { deckId: item.id })} onStudy={() => navigation.navigate('Study', { deckId: item.id })} />
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            <View style={styles.headerGlowContainer}>
                <Canvas style={{ flex: 1 }}>
                    <Rect x={0} y={0} width={width} height={150}>
                        <LinearGradient start={vec(width / 2, 0)} end={vec(width / 2, 150)} colors={[colors.primary + '26', 'transparent']} />
                    </Rect>
                </Canvas>
            </View>

            <FlatList
                data={filteredDecks}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                ListHeaderComponent={
                    <View>
                        <SearchFilterBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                        />
                    </View>
                }
                ListEmptyComponent={<EmptyState />}
            />

            {/* Menu Overlay */}
            {menuVisible && (
                <View style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
                    <Animated.View style={[styles.menuOverlay, overlayAnimatedStyle]}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={toggleMenu} activeOpacity={1} />
                    </Animated.View>

                    <View style={styles.menuContainer}>
                        <Animated.View style={[styles.menuBox, menuAnimatedStyle, { backgroundColor: colors.surface, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                            <TouchableOpacity
                                style={[styles.menuButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                                onPress={() => { toggleMenu(); navigation.navigate('AddDeck'); }}
                            >
                                <View style={styles.menuIconContainer}>
                                    <Ionicons name="grid-outline" size={32} color={colors.text} />
                                    <View style={[styles.plusBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
                                        <Ionicons name="add" size={12} color="white" />
                                    </View>
                                </View>
                                <Text style={[styles.menuButtonLabel, { color: colors.text }]}>Create Deck</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                                onPress={() => { toggleMenu(); navigation.navigate('Explore'); }}
                            >
                                <Ionicons name="library-outline" size={34} color={colors.text} />
                                <Text style={[styles.menuButtonLabel, { color: colors.text }]}>Explore</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
            )}

            <View style={styles.centerFabContainer}>
                <TouchableOpacity onPress={toggleMenu} activeOpacity={0.8}>
                    <Animated.View style={[styles.centralFab, fabStyle, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                        <Ionicons name="add" size={30} color={colors.white} />
                    </Animated.View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    headerGlowContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 0, pointerEvents: 'none' },
    listContent: { padding: theme.spacing.m, paddingTop: theme.spacing.xl + 20, paddingBottom: 100, zIndex: 1 },
    centerFabContainer: { position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
    centralFab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    fabLabel: { color: theme.colors.white, fontSize: 18, fontWeight: '600' },
    menuOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 100, // Above the FAB
        pointerEvents: 'box-none',
    },
    menuBox: {
        flexDirection: 'row',
        gap: 16,
        padding: 20,
        borderRadius: 24,
        backgroundColor: theme.colors.surface, // Fallback if no blur
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    menuButton: {
        width: 130,
        height: 110,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 12,
    },
    menuIconContainer: {
        position: 'relative',
    },
    plusBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: theme.colors.surface,
    },
    menuButtonLabel: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
});
