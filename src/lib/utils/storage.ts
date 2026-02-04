import { STORAGE_KEYS } from "@/lib/config/storage-keys";
import { User } from "@prisma/client";

export const LocalStorageUtils = {
    // Auth Tokens
    setToken: (token: string): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    },
    getToken: (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    },
    removeToken: (): void => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    },

    // Refresh Token
    setRefreshToken: (token: string): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    },
    getRefreshToken: (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    },
    removeRefreshToken: (): void => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    },

    // User Data (Cached Profile)
    setUser: (user: User): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    },
    getUser: (): User | null => {
        if (typeof window === "undefined") return null;
        const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (!data) return null;
        try {
            return JSON.parse(data) as User;
        } catch (e) {
            console.error("Failed to parse user data from storage", e);
            return null;
        }
    },
    removeUser: (): void => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    },

    // Auth Clear (Logout)
    clearAuth: (): void => {
        if (typeof window === "undefined") return;
        // Targeted clear
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem("post_onboarding_redirect");

        // As per user request "clear the data as well from all the storage"
        // We'll trust the caller to use localStorage.clear() if they want the nuclear option, 
        // but for this utility, we'll clear all known app keys.
        // Actually, let's just clear everything to be safe and compliant with the request "all the storage"
        localStorage.clear();
        sessionStorage.clear();
    },

    // Typed helpers
    getPreferredView: (): 'admin' | 'user' | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(STORAGE_KEYS.PREFERRED_VIEW) as 'admin' | 'user' | null;
    },
    setPreferredView: (view: 'admin' | 'user'): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(STORAGE_KEYS.PREFERRED_VIEW, view);
    }
};

