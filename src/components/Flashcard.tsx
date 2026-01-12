import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, ViewStyle, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolate,
    SharedValue
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../types';
import { theme } from '../constants/theme';

interface Props {
    card: Card;
    onFlip?: () => void;
    style?: ViewStyle;
    animatedStyle?: any; // For swipe animations
    isFlipped: boolean;
}

export const Flashcard: React.FC<Props> = ({ card, onFlip, style, animatedStyle, isFlipped }) => {
    const spin = useSharedValue(0);

    useEffect(() => {
        spin.value = withTiming(isFlipped ? 180 : 0, { duration: 500 });
    }, [isFlipped]);

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const spinVal = interpolate(spin.value, [0, 180], [0, 180], Extrapolate.CLAMP);
        return {
            transform: [{ rotateY: `${spinVal}deg` }],
            opacity: spin.value < 90 ? 1 : 0,
            zIndex: spin.value < 90 ? 2 : 1,
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const spinVal = interpolate(spin.value, [0, 180], [180, 360], Extrapolate.CLAMP);
        return {
            transform: [{ rotateY: `${spinVal}deg` }],
            opacity: spin.value > 90 ? 1 : 0,
            zIndex: spin.value > 90 ? 2 : 1,
        };
    });

    const handlePress = () => {
        if (onFlip) {
            onFlip();
        }
    };

    const handleSpeak = (text: string) => {
        Speech.stop();
        Speech.speak(text, { language: 'en' });
    };

    useEffect(() => {
        return () => {
            Speech.stop();
        };
    }, []);

    return (
        <TouchableWithoutFeedback onPress={handlePress}>
            <Animated.View style={[styles.container, style, animatedStyle]}>
                <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                    <View style={styles.iconPlaceholder}>
                        <Ionicons name="help-circle-outline" size={80} color={theme.colors.primary} style={{ opacity: 0.8 }} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.text}>{card.front}</Text>
                        <TouchableOpacity onPress={() => handleSpeak(card.front)} style={styles.speakerButton}>
                            <Ionicons name="volume-high" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.hint}>Tap to flip</Text>
                </Animated.View>
                <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                    <View style={styles.textContainer}>
                        <Text style={styles.text}>{card.back}</Text>

                    </View>
                    {card.exampleSentence && (
                        <Text style={styles.example}>"{card.exampleSentence}"</Text>
                    )}
                </Animated.View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.85, 400); // 85% of screen width, max 400
const CARD_HEIGHT = CARD_WIDTH * 1.3; // Aspect ratio 1.5

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.l,
        alignItems: 'center',
        justifyContent: 'center',
        backfaceVisibility: 'hidden',
        // Neon Glow Effect
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
        padding: theme.spacing.l,
        borderWidth: 1,
        borderColor: 'rgba(76, 139, 245, 0.3)', // Subtle border matching primary color
    },
    cardFront: {
        // zIndex handled dynamically
    },
    cardBack: {
        // zIndex handled dynamically
        transform: [{ rotateY: '180deg' }],
    },
    text: {
        ...theme.typography.h1,
        color: theme.colors.textDark,
        textAlign: 'center',
        marginBottom: theme.spacing.m,
    },
    textContainer: {
        width: '100%',
        height: '55%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.m,
    },
    speakerButton: {
        marginTop: theme.spacing.s,
        padding: 8,
    },
    hint: {
        ...theme.typography.caption,
        position: 'absolute',
        bottom: theme.spacing.m,
    },
    example: {
        ...theme.typography.body,
        color: theme.colors.textSecondaryDark,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: theme.spacing.m,
    },
    cardImage: {
        width: '100%',
        height: '45%',
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
    },
    iconPlaceholder: {
        width: '100%',
        height: '45%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 139, 245, 0.05)',
        borderTopLeftRadius: theme.borderRadius.l,
        borderTopRightRadius: theme.borderRadius.l,
    },
});
