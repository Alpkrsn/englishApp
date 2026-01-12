import { Deck, Card } from '../types';
import { StorageService } from './StorageService';
import A1Basics from '../data/presetDecks/A1Basics.json';
import A2Elementary from '../data/presetDecks/A2Elementary.json';
import B1Intermediate from '../data/presetDecks/B1Intermediate.json';
import B2UpperIntermediate from '../data/presetDecks/B2UpperIntermediate.json';
import C1Advanced from '../data/presetDecks/C1Advanced.json';
import C2Proficiency from '../data/presetDecks/C2Proficiency.json';
import { AudioAssets } from './AudioAssets';
import { Asset } from 'expo-asset';

// Map of available presets
// In a real app, this might be dynamic or fetched from a remote source
const PRESET_DECKS: Record<string, any> = {
    'preset_a1_1': A1Basics,
    'preset_a2_1': A2Elementary,
    'preset_b1_1': B1Intermediate,
    'preset_b2_1': B2UpperIntermediate,
    'preset_c1_1': C1Advanced,
    'preset_c2_1': C2Proficiency,
};

export interface PresetDeckSummary {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    cardCount: number;
    isPreset: boolean;
}

export const PresetDeckService = {
    /**
     * Returns a list of available preset decks (metadata only)
     */
    getPresetDecks: (): PresetDeckSummary[] => {
        return Object.values(PRESET_DECKS).map(deck => ({
            id: deck.id,
            title: deck.title,
            description: deck.description,
            category: deck.category,
            level: deck.level,
            cardCount: deck.cards.length,
            isPreset: true
        }));
    },

    /**
     * Imports a preset deck into the user's library
     * - Generates new IDs to prevent collisions
     * - Resets SRS statistics
     */
    importPresetDeck: async (presetId: string): Promise<void> => {
        const preset = PRESET_DECKS[presetId];
        if (!preset) throw new Error('Preset deck not found');

        // Generate a unique ID for the new deck
        const newDeckId = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        // Process cards: new IDs, reset stats
        const newCards: Card[] = preset.cards.map((card: any) => ({
            id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${card.id}`,
            front: card.front,
            back: card.back,
            exampleSentence: card.exampleSentence,
            imageUri: card.imageUri,
            imageBase64: card.imageBase64,
            audioUri: card.audioFile && AudioAssets[card.audioFile]
                ? Asset.fromModule(AudioAssets[card.audioFile]).uri
                : undefined,
            // Reset SRS fields
            interval: undefined,
            easeFactor: undefined,
            dueDate: undefined,
            reviewCount: 0
        }));

        const newDeck: Deck = {
            id: newDeckId,
            title: preset.title,
            cards: newCards,
            createdAt: Date.now(),
            isPreset: false // It becomes a normal user deck once imported
        };

        await StorageService.saveDeck(newDeck);
    }
};
