import { storage, getJSON, setJSON } from '../storage/mmkv';
import { Deck, Card } from '../types';

const DECK_INDEX_KEY = 'decks_index';

// Index holding only metadata
type DeckIndexItem = {
    id: string;
    title: string;
    createdAt: number;
    lastStudiedAt?: number;
    cardCount: number;
};

const getDeckCardsKey = (deckId: string) => `deck_cards_${deckId}`;

/**
 * INDEX READ/WRITE
 */
async function readDeckIndex(): Promise<DeckIndexItem[]> {
    return await getJSON<DeckIndexItem[]>(DECK_INDEX_KEY, []);
}

async function writeDeckIndex(index: DeckIndexItem[]) {
    await setJSON(DECK_INDEX_KEY, index);
}

/**
 * READ/WRITE CARDS FOR A SPECIFIC DECK
 */
async function readDeckCards(deckId: string): Promise<Card[]> {
    const key = getDeckCardsKey(deckId);
    return await getJSON<Card[]>(key, []);
}

async function writeDeckCards(deckId: string, cards: Card[]) {
    const key = getDeckCardsKey(deckId);
    await setJSON(key, cards);
}

/**
 * Find a specific deck in DeckIndex
 */
async function findDeckMeta(deckId: string): Promise<DeckIndexItem | undefined> {
    const index = await readDeckIndex();
    return index.find((d) => d.id === deckId);
}

/**
 * PUBLIC API
 * Re-implementation of StorageService functions with Async Adapter + INDEX
 */
export const StorageService = {
    /**
     * Returns all decks as full objects (meta + cards)
     * HomeScreen, DeckDetail etc. can use this.
     */
    async getDecks(): Promise<Deck[]> {
        const index = await readDeckIndex();

        // Fetch cards for all decks.
        // For large data, a separate "getDeckIndex" function could be written in the future for performance.
        const decks: Deck[] = await Promise.all(index.map(async (meta) => {
            const cards = await readDeckCards(meta.id);
            return {
                id: meta.id,
                title: meta.title,
                createdAt: meta.createdAt,
                lastStudiedAt: meta.lastStudiedAt,
                cards,
            };
        }));

        return decks;
    },

    /**
     * Get single deck (meta + cards)
     */
    async getDeckById(deckId: string): Promise<Deck | null> {
        const meta = await findDeckMeta(deckId);
        if (!meta) return null;
        const cards = await readDeckCards(deckId);

        return {
            id: meta.id,
            title: meta.title,
            createdAt: meta.createdAt,
            lastStudiedAt: meta.lastStudiedAt,
            cards,
        };
    },

    /**
     * Save new Deck (AddDeckScreen uses this)
     * Note: cards will usually be empty.
     */
    async saveDeck(deck: Deck): Promise<void> {
        const index = await readDeckIndex();
        const exists = index.find((d) => d.id === deck.id);

        if (exists) {
            // Update existing deck
            const updatedIndex = index.map((d) =>
                d.id === deck.id
                    ? {
                        ...d,
                        title: deck.title,
                        createdAt: deck.createdAt ?? d.createdAt,
                        lastStudiedAt: deck.lastStudiedAt ?? d.lastStudiedAt,
                        cardCount: deck.cards?.length ?? d.cardCount,
                    }
                    : d
            );
            await writeDeckIndex(updatedIndex);
        } else {
            // Add new deck
            const newMeta: DeckIndexItem = {
                id: deck.id,
                title: deck.title,
                createdAt: deck.createdAt ?? Date.now(),
                lastStudiedAt: deck.lastStudiedAt,
                cardCount: deck.cards ? deck.cards.length : 0,
            };
            await writeDeckIndex([...index, newMeta]);
        }

        // Save cards separately (even if empty)
        await writeDeckCards(deck.id, deck.cards ?? []);
    },

    /**
     * Save multiple decks (Legacy support or bulk import)
     * Replaces entire storage content with provided decks.
     */
    async saveDecks(decks: Deck[]): Promise<void> {
        // Rebuild index
        const newIndex: DeckIndexItem[] = decks.map(d => ({
            id: d.id,
            title: d.title,
            createdAt: d.createdAt ?? Date.now(),
            lastStudiedAt: d.lastStudiedAt,
            cardCount: d.cards ? d.cards.length : 0
        }));
        await writeDeckIndex(newIndex);

        // Save cards for each deck
        await Promise.all(decks.map(d => writeDeckCards(d.id, d.cards ?? [])));
    },

    /**
     * Delete Deck (DeckDetailScreen)
     */
    async deleteDeck(deckId: string): Promise<void> {
        const index = await readDeckIndex();
        const newIndex = index.filter((d) => d.id !== deckId);
        await writeDeckIndex(newIndex);

        const cardsKey = getDeckCardsKey(deckId);
        await storage.remove(cardsKey);
    },

    /**
     * Update deck title etc. (optional usage)
     */
    async updateDeck(deckId: string, payload: Partial<Pick<Deck, 'title'>>): Promise<void> {
        const index = await readDeckIndex();
        const newIndex = index.map((d) =>
            d.id === deckId
                ? {
                    ...d,
                    title: payload.title ?? d.title,
                }
                : d
        );
        await writeDeckIndex(newIndex);
    },

    /**
     * Add card to deck (AddCardScreen -> new card)
     */
    async addCardToDeck(deckId: string, card: Card): Promise<void> {
        const cards = await readDeckCards(deckId);
        const newCards = [...cards, card];
        await writeDeckCards(deckId, newCards);

        // Update cardCount in Index
        const index = await readDeckIndex();
        const newIndex = index.map((d) =>
            d.id === deckId
                ? {
                    ...d,
                    cardCount: newCards.length,
                }
                : d
        );
        await writeDeckIndex(newIndex);
    },

    /**
     * Update specific card in deck (AddCardScreen -> edit)
     */
    async updateCardInDeck(deckId: string, updatedCard: Card): Promise<void> {
        const cards = await readDeckCards(deckId);
        const newCards = cards.map((c) => (c.id === updatedCard.id ? updatedCard : c));
        await writeDeckCards(deckId, newCards);

        // Sync index cardCount even if unchanged
        const index = await readDeckIndex();
        const newIndex = index.map((d) =>
            d.id === deckId
                ? {
                    ...d,
                    cardCount: newCards.length,
                }
                : d
        );
        await writeDeckIndex(newIndex);
    },

    /**
     * Delete card from deck (AddCardScreen -> delete)
     */
    async deleteCardFromDeck(deckId: string, cardId: string): Promise<void> {
        const cards = await readDeckCards(deckId);
        const newCards = cards.filter((c) => c.id !== cardId);
        await writeDeckCards(deckId, newCards);

        // Update Index cardCount
        const index = await readDeckIndex();
        const newIndex = index.map((d) =>
            d.id === deckId
                ? {
                    ...d,
                    cardCount: newCards.length,
                }
                : d
        );
        await writeDeckIndex(newIndex);
    },

    /**
     * Update last studied timestamp
     */
    async updateLastStudied(deckId: string): Promise<void> {
        const index = await readDeckIndex();
        const newIndex = index.map((d) =>
            d.id === deckId
                ? {
                    ...d,
                    lastStudiedAt: Date.now(),
                }
                : d
        );
        await writeDeckIndex(newIndex);
    }
};
