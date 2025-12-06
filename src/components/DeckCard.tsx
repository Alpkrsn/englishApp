import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture, TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { Deck } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = -100; // Swipe left to study? Or right? User said "Right Swipe -> Quick Action" which usually means swiping the card to the right.
// User said: "Kartı sağa hafif çekince altta bir “STUDY” alanı görünür." -> Swipe Right.

interface DeckCardProps {
    deck: Deck;
    onPress: () => void;
    onStudy: () => void;
    index: number;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck, onPress, onStudy, index }) => {
    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);
    const isPressed = useSharedValue(false);

    const pan = Gesture.Pan()
        .activeOffsetX([-10, 10]) // Allow vertical scroll without triggering swipe easily
        .onUpdate((event) => {
            // Only allow swiping right
            if (event.translationX > 0) {
                translateX.value = event.translationX;
            }
        })
        .onEnd((event) => {
            if (event.translationX > 100) {
                // Trigger study action
                runOnJS(onStudy)();
                translateX.value = withSpring(0);
            } else {
                translateX.value = withSpring(0);
            }
        });

    const tap = Gesture.Tap()
        .onBegin(() => {
            isPressed.value = true;
            scale.value = withSpring(0.98);
        })
        .onFinalize(() => {
            isPressed.value = false;
            scale.value = withSpring(1);
            runOnJS(onPress)();
        });

    const composed = Gesture.Simultaneous(pan, tap);

    const rStyle = useAnimatedStyle(() => {


        return {
            transform: [
                { translateX: translateX.value },
                { scale: scale.value }
            ],
            shadowOpacity: withTiming(isPressed.value ? 0.3 : 0.1),
            shadowRadius: withTiming(isPressed.value ? 8 : 4),
            // Simulate glow with shadow color change or intensity
            shadowColor: isPressed.value ? theme.colors.primary : '#000',
        };
    });

    const rBackgroundStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(translateX.value, [0, 100], [0, 1]),
        };
    });

    return (
        <View style={styles.container}>
            {/* Background Action Layer */}
            <Animated.View style={[styles.actionBackground, rBackgroundStyle]}>
                <Text style={styles.actionText}>STUDY</Text>
            </Animated.View>

            {/* Card Layer */}
            <GestureDetector gesture={pan}>
                <TouchableOpacity activeOpacity={1} onPress={onPress}>
                    <Animated.View style={[styles.card, rStyle]}>
                        <View>
                            <Text style={styles.cardTitle}>{deck.title}</Text>
                            <Text style={styles.cardSubtitle}>{deck.cards.length} cards</Text>
                        </View>

                        <View style={styles.rightContainer}>

                            <Text style={styles.arrow}>{'>'}</Text>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.m,
        position: 'relative',
    },
    actionBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.success, // Green for Study
        borderRadius: theme.borderRadius.m,
        justifyContent: 'center',
        paddingLeft: 20,
        alignItems: 'flex-start',
    },
    actionText: {
        color: theme.colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        ...theme.typography.h2,
        fontSize: 18,
        color: theme.colors.textDark,
        marginBottom: theme.spacing.xs,
    },
    cardSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textSecondaryDark,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrow: {
        fontSize: 24,
        color: theme.colors.textSecondaryDark,
        fontWeight: 'bold',
        marginLeft: 10,
    },

});
