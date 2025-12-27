import * as FileSystem from 'expo-file-system/legacy';

const AUDIO_DIR = (FileSystem.documentDirectory || '') + 'audio/';

/**
 * Ensures the audio directory exists.
 */
const ensureDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
    }
};

/**
 * Saves an audio file to the app's internal storage.
 * @param uri The URI of the audio to save.
 * @returns The new local URI.
 */
export const saveAudio = async (uri: string): Promise<string> => {
    try {
        await ensureDirExists();

        // 1. Generate a unique filename with proper extension
        // We'll try to guess extension from URI or default to .m4a
        const ext = uri.split('.').pop() || 'm4a';
        const filename = new Date().getTime() + '.' + ext;
        const dest = AUDIO_DIR + filename;

        // 2. Copy the file to our app's storage
        await FileSystem.copyAsync({
            from: uri,
            to: dest,
        });

        return dest;
    } catch (error) {
        console.error('Error saving audio:', error);
        throw error;
    }
};

/**
 * Deletes an audio file from the app's internal storage.
 * @param uri The local URI of the audio to delete.
 */
export const deleteAudio = async (uri: string): Promise<void> => {
    try {
        // Only delete if it's in our audio directory
        if (uri.startsWith(AUDIO_DIR)) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
        }
    } catch (error) {
        console.error('Error deleting audio:', error);
    }
};
