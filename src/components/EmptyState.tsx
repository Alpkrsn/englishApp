import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Path, vec, LinearGradient } from '@shopify/react-native-skia';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export const EmptyState: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.illustrationContainer}>
                <Canvas style={{ width: 200, height: 200 }}>
                    {/* Neon Glow Effect - Background Abstract Shapes */}
                    <Path
                        path="M50 50 Q100 20 150 50 T250 50"
                        color={theme.colors.primary}
                        style="stroke"
                        strokeWidth={4}
                        opacity={0.5}
                    />

                    <Path
                        path="M50 70 Q100 40 150 70 T250 70"
                        color={theme.colors.primary}
                        style="stroke"
                        strokeWidth={4}
                        opacity={0.3}
                    />

                    {/* Card Silhouette */}
                    <Path
                        path="M70 60 L130 60 L130 140 L70 140 Z"
                        color="rgba(255,255,255,0.05)"
                        style="fill"
                    />
                    <Path
                        path="M70 60 L130 60 L130 140 L70 140 Z"
                        color={theme.colors.primary}
                        style="stroke"
                        strokeWidth={2}
                        opacity={0.5}
                    />
                </Canvas>
            </View>
            <Text style={styles.text}>No decks found</Text>
            <Text style={styles.subtext}>Create your first deck to get started!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    illustrationContainer: {
        width: 200,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    text: {
        ...theme.typography.h2,
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
    },
    subtext: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
});
