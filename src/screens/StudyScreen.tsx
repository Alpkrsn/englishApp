import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Deck, Card } from '../types';
import { StorageService } from '../utils/StorageService';
import { Flashcard } from '../components/Flashcard';
import { theme } from '../constants/theme';
import { SRSLogic } from '../utils/SRSLogic';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS, interpolate, Extrapolate } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

type Props = NativeStackScreenProps<RootStackParamList, 'Study'>;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export const StudyScreen: React.FC<Props> = ({ route, navigation }) => {
    const { deckId } = route.params;
    const [deck, setDeck] = useState<Deck | null>(null);
    const [activeCards, setActiveCards] = useState<Card[]>([]);
    const [nextRoundCards, setNextRoundCards] = useState<Card[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [roundNumber, setRoundNumber] = useState(1);
    const [isFinished, setIsFinished] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const cardScale = useSharedValue(1);
    const progress = useSharedValue(0);

    const prepareSession = async () => {
        const foundDeck = await StorageService.getDeckById(deckId);
        if (foundDeck) {
            setDeck(foundDeck);
            const settings = await StorageService.getUserSettings();
            const limit = settings.dailyCardLimit;

            let allCards = foundDeck.cards;
            const now = Date.now();

            // Separate cards by status
            const dueCards = allCards.filter(c => c.dueDate && c.dueDate <= now).sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
            const newCards = allCards.filter(c => !c.dueDate);
            const futureCards = allCards.filter(c => c.dueDate && c.dueDate > now).sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));

            // Priority: Due -> New -> Future (Cramming)
            let candidateCards = [...dueCards, ...newCards];

            // If strictly due+new is not enough to meet limit, fill with future cards
            if (candidateCards.length < limit) {
                const remainingSlots = limit - candidateCards.length;
                const fillers = futureCards.slice(0, remainingSlots);
                candidateCards = [...candidateCards, ...fillers];
            }

            // Apply limit (safe slice even if less than limit)
            let cardsToStudy = candidateCards.slice(0, limit);

            if (route.params.shuffle) {
                // Shuffle the selected batch
                for (let i = cardsToStudy.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [cardsToStudy[i], cardsToStudy[j]] = [cardsToStudy[j], cardsToStudy[i]];
                }
            }

            // If absolutely no cards found (empty deck?), avoid empty state issues if possible
            if (cardsToStudy.length === 0 && allCards.length > 0) {
                // Fallback: just show some cards if logic failed, though above logic covers all cases (Due+New+Future = All)
                cardsToStudy = allCards.slice(0, limit);
            }

            setActiveCards(cardsToStudy);
            setNextRoundCards([]);
            setCurrentIndex(0);
            setRoundNumber(1);
            setIsFinished(false);
            setIsFlipped(false);
            setSessionStats({ correct: 0, wrong: 0 });
            progress.value = withTiming(1 / Math.max(cardsToStudy.length, 1), { duration: 500 });
            StorageService.updateLastStudied(deckId);
        }
    };

    useEffect(() => {
        prepareSession();
    }, [deckId, route.params.shuffle]);

    useEffect(() => {
        if (activeCards.length > 0) {
            progress.value = withTiming((currentIndex + 1) / activeCards.length, { duration: 300 });
        }
    }, [currentIndex, activeCards.length]);

    const [isProcessing, setIsProcessing] = useState(false);

    const handleRate = (rating: 'again' | 'good' | 'easy') => {
        if (!deck || activeCards.length === 0 || isProcessing) return;

        setIsProcessing(true);

        const currentCard = activeCards[currentIndex];
        const updatedCard = SRSLogic.calculateNextReview(currentCard, rating);

        // Update stats (optimistic)
        setSessionStats(prev => ({
            correct: prev.correct + (rating !== 'again' ? 1 : 0),
            wrong: prev.wrong + (rating === 'again' ? 1 : 0)
        }));

        // STORAGE UPDATE (Background - Fire & Forget)
        StorageService.updateCardInDeck(deckId, updatedCard).catch(err => {
            console.error("Failed to save card progress:", err);
            // Ideally revert UI or show toast here, but for SRS flow speed is key
        });

        // Determine next steps
        let cardsForNextRound = [...nextRoundCards];
        if (updatedCard.dueDate && updatedCard.dueDate <= Date.now()) {
            // If still due (e.g. 'again'), keep for next round
            cardsForNextRound.push(updatedCard);
        }
        setNextRoundCards(cardsForNextRound);

        // IMMEDIATE UI RESET
        translateX.value = 0;
        translateY.value = 0;
        cardScale.value = 1;

        // Move to next card
        if (currentIndex < activeCards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            // Batch finished
            if (cardsForNextRound.length > 0) {
                // Start next round
                setActiveCards(cardsForNextRound);
                setNextRoundCards([]);
                setCurrentIndex(0);
                setRoundNumber(prev => prev + 1);
                setIsFlipped(false);
            } else {
                // Really finished
                setIsFinished(true);
            }
        }

        // Release lock shortly after
        setTimeout(() => {
            setIsProcessing(false);
        }, 300);
    };

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd((event) => {
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                const direction = event.translationX > 0 ? 'right' : 'left';
                const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
                translateX.value = withTiming(targetX, { duration: 200 }, () => {
                    const rating = direction === 'right' ? 'good' : 'again';
                    runOnJS(handleRate)(rating);
                });
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        });

    const cardAnimatedStyle = useAnimatedStyle(() => {
        const rotate = interpolate(translateX.value, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-15, 0, 15], Extrapolate.CLAMP);
        return { transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate: `${rotate}deg` }, { scale: cardScale.value }] };
    });

    const progressAnimatedStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

    const handleRestart = () => {
        prepareSession();
    };

    if (!deck || (activeCards.length === 0 && !isFinished)) return <View style={styles.container}><Text style={{ color: 'white' }}>Loading...</Text></View>;

    if (isFinished) {
        const accuracy = Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.wrong)) * 100) || 0;
        return (
            <View style={styles.finishedContainer}>
                <Text style={styles.finishedTitle}>Session Complete!</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}><Text style={styles.statValue}>{sessionStats.correct}</Text><Text style={styles.statLabel}>Correct</Text></View>
                    <View style={styles.statItem}><Text style={[styles.statValue, { color: theme.colors.error }]}>{sessionStats.wrong}</Text><Text style={styles.statLabel}>Wrong</Text></View>
                    <View style={styles.statItem}><Text style={[styles.statValue, { color: theme.colors.primary }]}>{accuracy}%</Text><Text style={styles.statLabel}>Accuracy</Text></View>
                </View>
                <TouchableOpacity style={theme.buttonVariants.neon} onPress={handleRestart}><Text style={styles.buttonText}>Study Again</Text></TouchableOpacity>
                <TouchableOpacity style={[theme.buttonVariants.outline, styles.secondaryButton]} onPress={() => navigation.goBack()}><Text style={[styles.buttonText, styles.secondaryButtonText]}>Back to Deck</Text></TouchableOpacity>
            </View>
        );
    }

    const currentCard = activeCards[currentIndex];

    // Safety guard for rapid transitions
    if (!currentCard) {
        return <View style={styles.container}><Text style={{ color: 'white' }}>Loading...</Text></View>;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.deckTitle}>{deck.title}</Text>
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>{currentIndex + 1} / {activeCards.length}</Text>
                        <View style={styles.progressBar}><Animated.View style={[styles.progressFill, progressAnimatedStyle]} /></View>
                    </View>
                </View>
                <View style={styles.cardArea}>
                    <GestureDetector gesture={gesture}>
                        <Flashcard key={`${currentCard.id}-${roundNumber}`} card={currentCard} onFlip={() => setIsFlipped(!isFlipped)} animatedStyle={cardAnimatedStyle} isFlipped={isFlipped} />
                    </GestureDetector>
                </View>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.actionButton, styles.wrongButton]} onPress={() => { translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 200 }, () => { runOnJS(handleRate)('again'); }); }}>
                        <Text style={styles.actionButtonText}>✕</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[theme.buttonVariants.neon, styles.flipButton]} onPress={() => setIsFlipped(!isFlipped)}>
                        <Text style={styles.buttonText}>{isFlipped ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.correctButton]} onPress={() => { translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 200 }, () => { runOnJS(handleRate)('good'); }); }}>
                        <Text style={styles.actionButtonText}>✓</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.m },
    header: { marginTop: theme.spacing.xl, marginBottom: theme.spacing.m },
    deckTitle: { ...theme.typography.h2, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.s },
    progressContainer: { alignItems: 'center' },
    progressText: { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs, fontSize: 12 },
    progressBar: { height: 6, width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 },
    cardArea: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl, paddingHorizontal: theme.spacing.l },
    actionButton: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
    wrongButton: { borderColor: theme.colors.error, backgroundColor: 'rgba(231, 76, 60, 0.1)' },
    correctButton: { borderColor: theme.colors.success, backgroundColor: 'rgba(46, 204, 113, 0.1)' },
    actionButtonText: { fontSize: 24, fontWeight: 'bold', color: theme.colors.white },
    flipButton: { width: 120, height: 50 },
    finishedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.l, backgroundColor: theme.colors.background },
    finishedTitle: { ...theme.typography.h1, color: theme.colors.success, marginBottom: theme.spacing.xl },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: theme.spacing.xl * 2 },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 32, fontWeight: 'bold', color: theme.colors.white },
    statLabel: { color: theme.colors.textSecondary, fontSize: 14 },
    buttonText: { color: theme.colors.white, fontSize: 18, fontWeight: 'bold' },
    secondaryButton: { marginTop: theme.spacing.m, borderColor: theme.colors.primary, width: '100%' },
    secondaryButtonText: { color: theme.colors.primary },
});
