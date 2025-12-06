import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

const IMAGES_DIR = (FileSystem.documentDirectory || '') + 'images/';

/**
 * Ensures the images directory exists.
 */
const ensureDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
    }
};

/**
 * Saves an image to the app's internal storage and generates a thumbnail.
 * @param uri The URI of the image to save (e.g., from picker).
 * @returns Object containing the new local URI and a base64 thumbnail.
 */
export const saveImage = async (uri: string): Promise<{ uri: string; base64: string }> => {
    try {
        await ensureDirExists();

        // 1. Generate a unique filename
        const filename = new Date().getTime() + '.jpg';
        const dest = IMAGES_DIR + filename;

        // 2. Copy the file to our app's storage
        await FileSystem.copyAsync({
            from: uri,
            to: dest,
        });

        // 3. Generate a small thumbnail (50x50) in Base64
        // We resize to a small width (e.g., 50px) to keep the string short.
        const manipResult = await ImageManipulator.manipulateAsync(
            dest,
            [{ resize: { width: 50 } }],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        return {
            uri: dest,
            base64: manipResult.base64 ? `data:image/jpeg;base64,${manipResult.base64}` : '',
        };
    } catch (error) {
        console.error('Error saving image:', error);
        throw error;
    }
};

/**
 * Deletes an image from the app's internal storage.
 * @param uri The local URI of the image to delete.
 */
export const deleteImage = async (uri: string): Promise<void> => {
    try {
        // Only delete if it's in our images directory
        if (uri.startsWith(IMAGES_DIR)) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};
