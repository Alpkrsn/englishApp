export interface Card {
    id: string;
    front: string;
    back: string;
    exampleSentence?: string;
    // Image Attachment
    imageUri?: string; // Local URI (file://...)
    imageBase64?: string; // Thumbnail for lists
    // Audio Attachment
    audioUri?: string; // Local URI (file://...)
    // SRS Fields
    interval?: number; // Days until next review
    easeFactor?: number; // Multiplier for next interval
    dueDate?: number; // Timestamp for next review
    reviewCount?: number; // Times reviewed
}

export interface Deck {
    id: string;
    title: string;
    cards: Card[];
    createdAt: number;
    lastStudiedAt?: number;
    isPreset?: boolean;
}

export type RootStackParamList = {
    Home: undefined;
    DeckDetail: { deckId: string };
    Study: { deckId: string; shuffle?: boolean };
    AddDeck: undefined;
    AddCard: { deckId: string; card?: Card };
    Explore: undefined;
    Settings: undefined;
};
