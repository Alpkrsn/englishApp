import React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolate,
    SharedValue
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Card } from '../types';
import { theme } from '../constants/theme';

interface Props {
    card: Card;
    onFlip?: () => void;
    style?: ViewStyle;
    animatedStyle?: any; // For swipe animations
}

export const Flashcard: React.FC<Props> = ({ card, onFlip, style, animatedStyle }) => {
    const spin = useSharedValue(0);

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
        spin.value = withTiming(spin.value === 0 ? 180 : 0, { duration: 500 });
        if (onFlip) {
            onFlip();
        }
    };

    return (
        <TouchableWithoutFeedback onPress={handlePress}>
            <Animated.View style={[styles.container, style, animatedStyle]}>
                <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                    {card.imageUri && (
                        <Image
                            source={{ uri: card.imageUri }}
                            style={styles.cardImage}
                            contentFit="cover"
                            transition={200}
                        />
                    )}
                    <Text style={styles.text}>{card.front}</Text>
                    <Text style={styles.hint}>Tap to flip</Text>
                </Animated.View>
                <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                    <Text style={styles.text}>{card.back}</Text>
                    {card.exampleSentence && (
                        <Text style={styles.example}>"{card.exampleSentence}"</Text>
                    )}
                </Animated.View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 300,
        height: 450, // Slightly taller for better proportions
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
        height: 180,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
    },
});
