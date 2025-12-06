import AsyncStorage from '@react-native-async-storage/async-storage';
// import { MMKV } from 'react-native-mmkv';

// NOTE: MMKV is not supported in Expo Go. 
// We use AsyncStorage for now to ensure the app runs.
// To use MMKV, you must create a Development Build (npx expo run:android)
// and then uncomment the MMKV code below and comment out the AsyncStorage code.

/*
export const mmkv = new MMKV({
  id: 'flashcards-storage',
});
*/

/**
 * Safe JSON parse helper
 */
export function safeParseJSON<T>(value: string | undefined | null, fallback: T): T {
    if (!value) return fallback;
    try {
        return JSON.parse(value) as T;
    } catch (e) {
        console.warn('[Storage] JSON parse error for value:', value, e);
        return fallback;
    }
}

/**
 * Storage Adapter (Async)
 * We make this async to support AsyncStorage. 
 * If you switch to MMKV later, these can remain async (just resolving immediately) 
 * or you can refactor to sync if you really need that micro-optimization.
 */

export const storage = {
    async getString(key: string): Promise<string | undefined> {
        try {
            const value = await AsyncStorage.getItem(key);
            return value ?? undefined;
        } catch (e) {
            console.warn('[Storage] Failed to get key:', key, e);
            return undefined;
        }
        // MMKV Implementation:
        // return mmkv.getString(key);
    },

    async set(key: string, value: string): Promise<void> {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (e) {
            console.warn('[Storage] Failed to set key:', key, e);
        }
        // MMKV Implementation:
        // mmkv.set(key, value);
    },

    async remove(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.warn('[Storage] Failed to remove key:', key, e);
        }
        // MMKV Implementation:
        // mmkv.delete(key);
    },

    async clearAll(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (e) {
            console.warn('[Storage] Failed to clear all', e);
        }
        // MMKV Implementation:
        // mmkv.clearAll();
    }
};

/**
 * JSON set helper
 */
export async function setJSON(key: string, value: unknown) {
    try {
        const serialized = JSON.stringify(value);
        await storage.set(key, serialized);
    } catch (e) {
        console.warn('[Storage] JSON stringify error for key:', key, e);
    }
}

/**
 * JSON get helper
 */
export async function getJSON<T>(key: string, fallback: T): Promise<T> {
    const stored = await storage.getString(key);
    return safeParseJSON<T>(stored, fallback);
}
