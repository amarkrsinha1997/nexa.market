/**
 * Utility to manage profile image caching in LocalStorage
 */

const CACHE_PREFIX = 'user_avatar_base64_';

export const ImageCacheUtils = {
    /**
     * Cache user avatar as base64 in LocalStorage
     * @param userId The user's ID
     * @param imageUrl The remote URL of the image
     * @returns The base64 string if successful, or null
     */
    cacheImage: async (userId: string, imageUrl: string): Promise<string | null> => {
        if (!userId || !imageUrl) return null;

        const cacheKey = `${CACHE_PREFIX}${userId}`;

        // precise check if we already have it to avoid re-downloading? 
        // For now, let's assume we want to refresh it if this is called, 
        // OR we can rely on the caller to only call this if it's missing.
        // But the user might update their profile picture, so usually we'd want a version/hash check.
        // Given the request "store it... to avoid fetching... again and again", 
        // we should probably check if the cached entry exists and maybe matches a stored URL?
        // Simpler for now: The caller handles the "if url changed" logic or we just overwrite.

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    try {
                        localStorage.setItem(cacheKey, base64data);
                        // Also store the original URL so we can check if it changed later if needed
                        localStorage.setItem(`${cacheKey}_url`, imageUrl);
                        resolve(base64data);
                    } catch (e) {
                        // Quota exceeded or other error
                        console.warn("Failed to cache image in localStorage", e);
                        resolve(null);
                    }
                };
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error fetching image for cache", error);
            return null;
        }
    },

    /**
     * Get cached base64 image from LocalStorage
     * @param userId The user's ID
     * @returns The base64 string or null
     */
    getCachedImage: (userId: string): string | null => {
        if (!userId) return null;
        return localStorage.getItem(`${CACHE_PREFIX}${userId}`);
    },

    /**
     * Get the cached source URL to compare if it changed
     */
    getCachedUrl: (userId: string): string | null => {
        if (!userId) return null;
        return localStorage.getItem(`${CACHE_PREFIX}${userId}_url`);
    },

    /**
     * Clear cached image for a user
     */
    clearCache: (userId: string) => {
        if (!userId) return;
        localStorage.removeItem(`${CACHE_PREFIX}${userId}`);
        localStorage.removeItem(`${CACHE_PREFIX}${userId}_url`);
    }
};
