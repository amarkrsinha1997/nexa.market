import { STORAGE_KEYS } from "@/lib/config/storage-keys";

export const LocalStorageUtils = {
    getItem: (key: string): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(key);
    },
    setItem: (key: string, value: string): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(key, value);
    },
    removeItem: (key: string): void => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(key);
    },
    clear: (): void => {
        if (typeof window === "undefined") return;
        localStorage.clear();
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
