import React, { useState, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Card } from '../types';
import { StorageService } from '../utils/StorageService';
import { theme } from '../constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, withRepeat } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Canvas, Path, BlurMask, Rect, RoundedRect, Skia, LinearGradient, vec } from '@shopify/react-native-skia';

type Props = NativeStackScreenProps<RootStackParamList, 'AddCard'>;
const { width, height } = Dimensions.get('window');

const BackgroundPattern = () => {
    const path = Skia.Path.Make();
    for (let i = 0; i < width; i += 40) {
        path.moveTo(i, 0);
        path.cubicTo(i + 50, height * 0.3, i - 50, height * 0.7, i, height);
    }
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Canvas style={{ flex: 1 }}>
                <Path path={path} color={theme.colors.primary} style="stroke" strokeWidth={0.5} opacity={0.05} />
                <Rect x={0} y={0} width={width} height={height} opacity={0.1}>
                    <LinearGradient start={vec(0, 0)} end={vec(width, height)} colors={[theme.colors.background, theme.colors.surface, theme.colors.background]} />
                </Rect>
            </Canvas>
        </View>
    );
};

const NeonInput: React.FC<any> = ({ label, value, onChangeText, placeholder, helperText, multiline, autoFocus, onSubmitEditing, inputRef, returnKeyType, isExample }) => {
    const focus = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => ({
        borderColor: withTiming(focus.value ? theme.colors.primary : theme.colors.border, { duration: 200 }),
        transform: [{ scale: withTiming(focus.value ? 1.02 : 1, { duration: 200 }) }],
        shadowOpacity: withTiming(focus.value ? 0.2 : 0, { duration: 200 }),
        shadowRadius: withTiming(focus.value ? 8 : 0, { duration: 200 }),
        shadowColor: theme.colors.primary,
        elevation: focus.value ? 4 : 0,
    }));

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <Animated.View style={[styles.inputWrapper, animatedStyle, isExample && styles.exampleInputWrapper]}>
                <TextInput
                    ref={inputRef}
                    style={[styles.input, multiline && styles.textArea]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textSecondaryDark}
                    value={value}
                    onChangeText={onChangeText}
                    multiline={multiline}
                    onFocus={() => (focus.value = 1)}
                    onBlur={() => (focus.value = 0)}
                    autoFocus={autoFocus}
                    onSubmitEditing={onSubmitEditing}
                    returnKeyType={returnKeyType}
                    blurOnSubmit={!multiline}
                />
            </Animated.View>
            {helperText && <Text style={styles.helperText}>{helperText}</Text>}
        </View>
    );
};

export const AddCardScreen: React.FC<Props> = ({ navigation, route }) => {
    const { deckId, card } = route.params;
    const isEditing = !!card;
    const [front, setFront] = useState(card?.front || '');
    const [back, setBack] = useState(card?.back || '');
    const [example, setExample] = useState(card?.exampleSentence || '');

    const frontInputRef = useRef<TextInput>(null);
    const backInputRef = useRef<TextInput>(null);
    const exampleInputRef = useRef<TextInput>(null);
    const saveButtonScale = useSharedValue(1);
    const deleteButtonScale = useSharedValue(1);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: isEditing ? 'Edit Card' : 'Add New Card',
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text,
        });
    }, [navigation, isEditing]);

    const handleSave = async () => {
        if (!front.trim() || !back.trim()) return Alert.alert('Error', 'Please enter both the word and its meaning');

        if (!isEditing) {
            const currentDeck = await StorageService.getDeckById(deckId);
            if (currentDeck?.cards.find(c => c.front.trim().toLowerCase() === front.trim().toLowerCase())) {
                return Alert.alert('Duplicate Card', 'Card already exists.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Save Anyway', onPress: saveCard }
                ]);
            }
        }
        saveCard();
    };

    const saveCard = async () => {
        const cardData: Card = {
            id: card?.id || Date.now().toString(),
            front: front.trim(),
            back: back.trim(),
            exampleSentence: example.trim(),
            // Remove media fields or keep them undefined if interface requires it
            imageUri: undefined,
            audioUri: undefined,
            interval: card?.interval,
            easeFactor: card?.easeFactor,
            dueDate: card?.dueDate,
            reviewCount: card?.reviewCount,
        };

        if (isEditing) {
            await StorageService.updateCardInDeck(deckId, cardData);
            Alert.alert('Success', 'Card updated', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } else {
            await StorageService.addCardToDeck(deckId, cardData);
            Alert.alert('Success', 'Card added', [
                { text: 'Add Another', onPress: () => { setFront(''); setBack(''); setExample(''); frontInputRef.current?.focus(); } },
                { text: 'Done', onPress: () => navigation.goBack() },
            ]);
        }
    };

    const handleDelete = async () => {
        if (!card) return;
        Alert.alert('Delete Card', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => { await StorageService.deleteCardFromDeck(deckId, card.id); navigation.goBack(); } },
        ]);
    };

    const saveGesture = Gesture.Tap()
        .onBegin(() => { saveButtonScale.value = withSpring(0.97); })
        .onFinalize(() => { saveButtonScale.value = withSpring(1); });

    const deleteLongPress = Gesture.LongPress()
        .onBegin(() => {
            deleteButtonScale.value = withSequence(withTiming(0.8, { duration: 100 }), withRepeat(withTiming(0.85, { duration: 50 }), 4, true), withTiming(1, { duration: 100 }));
        });

    return (
        <View style={styles.container}>
            <BackgroundPattern />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <NeonInput label="Front (Word / Phrase)" value={front} onChangeText={setFront} placeholder="e.g., Ephemeral" helperText="Card front." autoFocus={!isEditing} inputRef={frontInputRef} returnKeyType="next" onSubmitEditing={() => backInputRef.current?.focus()} />
                    <NeonInput label="Back (Meaning / Translation)" value={back} onChangeText={setBack} placeholder="e.g., Short lived" helperText="Card back." multiline inputRef={backInputRef} />
                    <NeonInput label="Example Sentence" value={example} onChangeText={setExample} placeholder="e.g., Fashions are ephemeral." multiline inputRef={exampleInputRef} isExample />

                    <View style={styles.footer}>
                        <GestureDetector gesture={saveGesture}>
                            <Animated.View style={{ transform: [{ scale: saveButtonScale }] }}>
                                <TouchableOpacity activeOpacity={1} onPress={handleSave} style={styles.saveButtonContainer}>
                                    <View style={StyleSheet.absoluteFill}>
                                        <Canvas style={{ flex: 1 }}>
                                            <RoundedRect x={0} y={0} width={width - 48} height={60} r={24} color={isEditing ? theme.colors.primary : theme.colors.success} opacity={0.1} />
                                            <BlurMask blur={10} style="normal" />
                                        </Canvas>
                                    </View>
                                    <View style={[theme.buttonVariants.neon, { backgroundColor: isEditing ? theme.colors.primary : theme.colors.success }]}>
                                        <Text style={styles.buttonText}>{isEditing ? 'Update Card' : 'Add Card'}</Text>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        </GestureDetector>

                        {isEditing && (
                            <GestureDetector gesture={deleteLongPress}>
                                <Animated.View style={{ transform: [{ scale: deleteButtonScale }] }}>
                                    <TouchableOpacity onPress={handleDelete} delayLongPress={200} style={styles.deleteButton}>
                                        <Text style={styles.deleteButtonText}>Delete Card</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </GestureDetector>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { padding: theme.spacing.l, paddingBottom: 100 },
    inputContainer: { marginBottom: theme.spacing.l },
    label: { ...theme.typography.body, fontWeight: '600', marginBottom: theme.spacing.s, color: theme.colors.text },
    helperText: { ...theme.typography.caption, marginTop: theme.spacing.xs, color: theme.colors.textSecondaryDark, opacity: 0.7 },
    inputWrapper: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.l, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
    exampleInputWrapper: { backgroundColor: theme.colors.secondary },
    input: { padding: theme.spacing.m, fontSize: 16, color: theme.colors.textDark },
    textArea: { height: 100, textAlignVertical: 'top' },
    footer: { marginTop: theme.spacing.xl, gap: theme.spacing.m },
    saveButtonContainer: { borderRadius: 24 },
    buttonText: { color: theme.colors.white, fontSize: 18, fontWeight: 'bold' },
    deleteButton: { alignItems: 'center', padding: theme.spacing.m, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.error, borderRadius: theme.borderRadius.l },
    deleteButtonText: { color: theme.colors.error, fontWeight: 'bold', fontSize: 16 },
});
