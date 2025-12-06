import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, Dimensions, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Deck, Card } from '../types';
import { StorageService } from '../utils/StorageService';
import { theme } from '../constants/theme';
import Animated, { FadeInDown, FadeOutUp, useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence } from 'react-native-reanimated';
import { Canvas, Rect, LinearGradient, vec, BlurMask } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
type Props = NativeStackScreenProps<RootStackParamList, 'DeckDetail'>;

const AnimatedCardItem = ({ item, index, onPress }: { item: Card; index: number; onPress: () => void }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify().damping(15)} exiting={FadeOutUp}>
            <Pressable onPress={onPress} onPressIn={() => scale.value = withSpring(0.96)} onPressOut={() => scale.value = withSpring(1)} style={styles.cardWrapper}>
                <Animated.View style={[styles.cardItem, animatedStyle]}>
                    <View style={styles.cardContent}>
                        <View style={styles.cardTextContainer}>
                            <Text style={styles.cardFront} numberOfLines={1}>{item.front}</Text>
                            <Text style={styles.cardBack} numberOfLines={1}>{item.back}</Text>
                        </View>
                        <View style={styles.cardAction}>
                            <Ionicons name="pencil" size={18} color={theme.colors.primary} />
                            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 4 }} />
                        </View>
                    </View>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

export const DeckDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { deckId } = route.params;
    const [deck, setDeck] = useState<Deck | null>(null);
    const [isShuffleOn, setIsShuffleOn] = useState(false);
    const headerGlowOpacity = useSharedValue(0);
    const deleteShake = useSharedValue(0);
    const shuffleScale = useSharedValue(1);
    const shuffleRotate = useSharedValue(0);

    const loadDeck = async () => { setDeck(await StorageService.getDeckById(deckId)); };

    useFocusEffect(useCallback(() => { loadDeck(); headerGlowOpacity.value = withTiming(1, { duration: 1000 }); }, [deckId]));

    const handleDeleteDeck = async () => {
        deleteShake.value = withSequence(withTiming(10, { duration: 50 }), withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }), withTiming(-10, { duration: 50 }), withTiming(0, { duration: 50 }));
        Alert.alert('Delete Deck', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await StorageService.deleteDeck(deckId); navigation.goBack(); } }]);
    };

    const handleShuffleChange = (value: boolean) => {
        setIsShuffleOn(value);
        shuffleScale.value = withSequence(withTiming(1.2, { duration: 100 }), withTiming(1, { duration: 100 }));
        shuffleRotate.value = withSpring(value ? 12 : 0);
    };

    const deleteButtonStyle = useAnimatedStyle(() => ({ transform: [{ translateX: deleteShake.value }] }));
    const shuffleStyle = useAnimatedStyle(() => ({ transform: [{ scale: shuffleScale.value }, { rotate: `${shuffleRotate.value}deg` }] }));

    if (!deck) return <View style={styles.container}><Text style={{ color: theme.colors.text }}>Loading...</Text></View>;

    return (
        <View style={styles.container}>
            <View style={styles.headerGlowContainer}>
                <Canvas style={{ flex: 1 }}>
                    <Rect x={0} y={0} width={width} height={200}>
                        <LinearGradient start={vec(width / 2, 0)} end={vec(width / 2, 200)} colors={['rgba(76, 139, 245, 0.2)', 'transparent']} />
                        <BlurMask blur={20} style="normal" />
                    </Rect>
                    <Rect x={width * 0.1} y={0} width={width * 0.8} height={2} color={theme.colors.primary} opacity={0.5}><BlurMask blur={4} style="normal" /></Rect>
                </Canvas>
            </View>

            <View style={styles.header}>
                <Animated.View entering={FadeInDown.delay(100).springify()}><Text style={styles.title}>{deck.title}</Text></Animated.View>
                <Animated.View entering={FadeInDown.delay(200).springify()}><Text style={styles.subtitle}>{deck.cards.length} cards</Text></Animated.View>
            </View>

            <View style={styles.actions}>
                <Animated.View style={[styles.shuffleContainer, shuffleStyle]}>
                    <Text style={styles.shuffleLabel}>Shuffle</Text>
                    <Switch value={isShuffleOn} onValueChange={handleShuffleChange} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} thumbColor={theme.colors.white} />
                </Animated.View>
                <TouchableOpacity style={[theme.buttonVariants.neon, styles.actionButton]} onPress={() => navigation.navigate('Study', { deckId: deck.id, shuffle: isShuffleOn })} disabled={deck.cards.length === 0} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Start Review</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[theme.buttonVariants.outline, styles.actionButton, { borderColor: theme.colors.textSecondary }]} onPress={() => navigation.navigate('AddCard', { deckId: deck.id })} activeOpacity={0.7}>
                    <Text style={[styles.buttonText, { color: theme.colors.text }]}>Add Card</Text>
                </TouchableOpacity>
            </View>

            <Animated.FlatList
                data={deck.cards} keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <AnimatedCardItem item={item} index={index} onPress={() => navigation.navigate('AddCard', { deckId, card: item })} />}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Animated.View entering={FadeInDown.delay(300)}><Text style={styles.emptyText}>No cards in this deck yet.</Text></Animated.View>}
                showsVerticalScrollIndicator={false}
            />

            <Animated.View style={deleteButtonStyle}>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteDeck}><Text style={styles.deleteButtonText}>Delete Deck</Text></TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60 },
    headerGlowContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, zIndex: -1 },
    header: { alignItems: 'center', marginBottom: theme.spacing.l, paddingHorizontal: theme.spacing.m },
    title: { ...theme.typography.h1, color: theme.colors.text, marginBottom: theme.spacing.xs, textAlign: 'center', textShadowColor: 'rgba(76, 139, 245, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
    subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, opacity: 0.8 },
    actions: { alignItems: 'center', marginBottom: theme.spacing.l, paddingHorizontal: theme.spacing.m },
    shuffleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.m, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    shuffleLabel: { color: theme.colors.text, fontSize: 16, marginRight: theme.spacing.s, fontWeight: '600' },
    actionButton: { marginBottom: theme.spacing.m, width: '100%', height: 50, justifyContent: 'center', alignItems: 'center' },
    buttonText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.white },
    list: { paddingHorizontal: theme.spacing.m, paddingBottom: 40 },
    cardWrapper: { marginBottom: theme.spacing.s },
    cardItem: { backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, borderWidth: 1, borderColor: 'rgba(76, 139, 245, 0.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardTextContainer: { flex: 1, marginRight: 10 },
    cardFront: { fontSize: 17, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
    cardBack: { fontSize: 15, color: theme.colors.textSecondary },
    cardAction: { flexDirection: 'row', alignItems: 'center', opacity: 0.7 },
    emptyText: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: theme.spacing.xl },
    deleteButton: { marginTop: theme.spacing.s, marginBottom: theme.spacing.xl, alignItems: 'center', padding: theme.spacing.m },
    deleteButtonText: { color: theme.colors.error, fontWeight: 'bold', opacity: 0.8 },
});
