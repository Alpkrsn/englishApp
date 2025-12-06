import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Deck } from '../types';
import { StorageService } from '../utils/StorageService';
import { theme } from '../constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withRepeat, interpolate, interpolateColor, Easing, FadeInDown } from 'react-native-reanimated';
import { Canvas, Circle, BlurMask, LinearGradient, Rect, vec, Group } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
type Props = NativeStackScreenProps<RootStackParamList, 'AddDeck'>;

const ParticleBackground = () => {
    const time = useSharedValue(0);
    useEffect(() => { time.value = withRepeat(withTiming(2 * Math.PI, { duration: 10000, easing: Easing.linear }), -1, false); }, []);
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Canvas style={{ flex: 1 }}>
                <Group opacity={0.3}>
                    <Circle cx={width * 0.2} cy={height * 0.3} r={40} color={theme.colors.primary}><BlurMask blur={30} style="normal" /></Circle>
                    <Circle cx={width * 0.8} cy={height * 0.6} r={60} color={theme.colors.secondary}><BlurMask blur={40} style="normal" /></Circle>
                    <Circle cx={width * 0.5} cy={height * 0.8} r={30} color={theme.colors.accent}><BlurMask blur={25} style="normal" /></Circle>
                </Group>
            </Canvas>
        </View>
    );
};

export const AddDeckScreen: React.FC<Props> = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputFocus = useSharedValue(0);
    const buttonScale = useSharedValue(1);
    const successOpacity = useSharedValue(0);

    const handleCreateDeck = async () => {
        if (!title.trim()) return Alert.alert('Error', 'Please enter a deck title');
        buttonScale.value = withSequence(withTiming(1.1, { duration: 100 }), withTiming(1, { duration: 100 }));
        successOpacity.value = withTiming(1, { duration: 300 });
        setTimeout(async () => {
            const newDeck: Deck = { id: Date.now().toString(), title: title.trim(), cards: [], createdAt: Date.now() };
            await StorageService.saveDeck(newDeck);
            navigation.goBack();
        }, 500);
    };

    const inputStyle = useAnimatedStyle(() => ({
        borderColor: interpolateColor(inputFocus.value, [0, 1], [theme.colors.border, theme.colors.primary]),
        transform: [{ scale: interpolate(inputFocus.value, [0, 1], [1, 1.02]) }],
        shadowOpacity: interpolate(inputFocus.value, [0, 1], [0, 0.2]),
        shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: inputFocus.value * 5,
    }));

    const labelStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(inputFocus.value, [0, 1], [0, -25]) }, { scale: interpolate(inputFocus.value, [0, 1], [1, 0.9]) }],
        color: interpolateColor(inputFocus.value, [0, 1], [theme.colors.textSecondary, theme.colors.primary]),
    }));

    return (
        <View style={styles.container}>
            <ParticleBackground />
            <View style={styles.headerGlow}>
                <Canvas style={{ flex: 1 }}>
                    <Rect x={0} y={0} width={width} height={150}>
                        <LinearGradient start={vec(0, 0)} end={vec(width, 150)} colors={['rgba(76, 139, 245, 0.2)', 'transparent']} />
                    </Rect>
                </Canvas>
            </View>
            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(100)}><Text style={styles.headerTitle}>Create New Deck</Text></Animated.View>
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Animated.Text style={[styles.label, labelStyle]}>Deck Title</Animated.Text>
                        <Animated.View style={[styles.inputWrapper, inputStyle]}>
                            <TextInput
                                style={styles.input}
                                placeholder={isFocused ? "e.g., Common Verbs" : ""}
                                placeholderTextColor={theme.colors.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                                onFocus={() => { inputFocus.value = withTiming(1); setIsFocused(true); }}
                                onBlur={() => { inputFocus.value = withTiming(0); setIsFocused(false); }}
                                autoFocus
                                onSubmitEditing={handleCreateDeck}
                            />
                        </Animated.View>
                    </View>
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <TouchableOpacity style={[theme.buttonVariants.neon, styles.createButton]} onPress={handleCreateDeck} activeOpacity={0.8}>
                            <Text style={styles.buttonText}>Create Deck</Text>
                            <Animated.View style={[styles.successIcon, { opacity: successOpacity }]}><Ionicons name="checkmark-circle" size={24} color={theme.colors.white} /></Animated.View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    headerGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: -1 },
    content: { flex: 1, padding: theme.spacing.m, justifyContent: 'center' },
    headerTitle: { ...theme.typography.h1, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.xl, textShadowColor: 'rgba(76, 139, 245, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
    form: { width: '100%' },
    inputContainer: { marginBottom: theme.spacing.xl, height: 80, justifyContent: 'flex-end' },
    label: { position: 'absolute', left: theme.spacing.m, top: 25, fontSize: 16, fontWeight: '600', zIndex: 1 },
    inputWrapper: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.m, borderWidth: 1, borderColor: theme.colors.border },
    input: { padding: theme.spacing.m, fontSize: 18, color: theme.colors.text, height: 56 },
    createButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 56 },
    buttonText: { color: theme.colors.white, fontSize: 18, fontWeight: 'bold', marginRight: 8 },
    successIcon: { position: 'absolute', right: 16 },
});
