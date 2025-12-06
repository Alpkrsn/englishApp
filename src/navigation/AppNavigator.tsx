import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { HomeScreen } from '../screens/HomeScreen';
import { DeckDetailScreen } from '../screens/DeckDetailScreen';
import { StudyScreen } from '../screens/StudyScreen';
import { AddDeckScreen } from '../screens/AddDeckScreen';
import { AddCardScreen } from '../screens/AddCardScreen';
import { ExploreScreen } from '../screens/ExploreScreen';

import { theme } from '../constants/theme';
import { TopBar } from '../components/TopBar';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    header: (props) => <TopBar {...props} />,
                    contentStyle: {
                        backgroundColor: theme.colors.background,
                    },
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'linguApp' }}
                />
                <Stack.Screen
                    name="DeckDetail"
                    component={DeckDetailScreen}
                    options={{ title: 'Deck Details' }}
                />
                <Stack.Screen
                    name="Study"
                    component={StudyScreen}
                    options={{ title: 'Study Mode' }}
                />
                <Stack.Screen
                    name="AddDeck"
                    component={AddDeckScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AddCard"
                    component={AddCardScreen}
                    options={{ title: '' }}
                />
                <Stack.Screen
                    name="Explore"
                    component={ExploreScreen}
                    options={{ title: 'Explore Decks' }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    );
};
