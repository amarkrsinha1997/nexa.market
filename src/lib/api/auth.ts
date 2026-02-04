import { apiClient, ApiResponse } from "./client";
import { STORAGE_KEYS } from "../config/storage-keys";
import { API_CONFIG } from "../config/api";

let refreshPromise: Promise<boolean> | null = null;

export interface User {
    id: string;
    userId: string;
    email: string;
    name: string;
    username: string;
    photoUrl: string;
    dateOfBirth: string | null;
    phoneNumber: string | null;
    nexaWalletAddress: string | null;
    referralCode: string;
    isEarlyUser: boolean;
    role: string;
    // other fields...
    walletAddressChangeCount: number;
    lastLoginAt: string | null;
    createdAt: string;
    isOnboardingCompleted: boolean;
    picture: string | null;
}

export interface AuthResponse {
    user: User;
    isNewUser: boolean;
    refreshToken?: string;
    accessToken?: string;
    idToken?: string;
    expiryDate?: number;
}

export const authApi = {
    /**
     * Check if JWT token is expired
     */
    isTokenExpired(token: string): boolean {
        if (!token) return true;
        try {
            const payloadBase64 = token.split(".")[1];
            const binaryString = atob(payloadBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.codePointAt(i) || 0;
            }
            const decodedString = new TextDecoder().decode(bytes);
            const decodedJson = JSON.parse(decodedString);
            const exp = decodedJson.exp;
            const now = Date.now() / 1000;
            // Add 10 seconds buffer to be safe (matching previous client implementation)
            return exp < (now + 10);
        } catch {
            // If token is malformed or invalid, consider it expired
            return true;
        }
    },

    async getProfile(force: boolean = false): Promise<ApiResponse<AuthResponse>> {
        if (!force) {
            const storedUser = this.getStoredUser();
            const lastFetch = localStorage.getItem(STORAGE_KEYS.LAST_PROFILE_FETCH);
            const now = Date.now();

            // Cache for 5 minutes
            if (storedUser && lastFetch && now - parseInt(lastFetch) < 5 * 60 * 1000) {
                console.log("[Auth] Returning cached profile");
                return { success: true, data: { user: storedUser, isNewUser: false } };
            }
        }

        const response = await apiClient.get<AuthResponse>("/user/profile");
        if (response.success && response.data) {
            this.storeUser(response.data.user);
            localStorage.setItem(STORAGE_KEYS.LAST_PROFILE_FETCH, Date.now().toString());
        }
        return response;
    },

    /**
     * Authenticate with Google OAuth (supports Authorization Code flow)
     */
    async googleLogin(
        params: { code?: string; googleToken?: string; referralCode?: string }
    ): Promise<ApiResponse<AuthResponse>> {
        const response = await apiClient.post<AuthResponse>("/auth/google", {
            code: params.code,
            googleToken: params.googleToken,
            referralCode: params.referralCode,
        });

        if (response.success && response.data) {
            if (params.googleToken) {
                // Legacy flow
                localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, params.googleToken);
            } else {
                // Auth Code flow
                if (response.data.refreshToken) {
                    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
                }

                // Store the ID token returned from backend as our session token
                if (response.data.idToken) {
                    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.idToken);
                }
            }
        }

        return response;
    },

    /**
     * Refresh the access token using the stored refresh token
     * Centralized Singleton Implementation
     * @param force If true, forces refresh even if token seems valid (for 401s)
     */
    async refreshSession(force: boolean = false): Promise<boolean> {
        // 1. Check expiration (unless forced)
        if (!force) {
            const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (token && !this.isTokenExpired(token)) {
                return true;
            }
        }

        // 2. Singleton Promise
        if (refreshPromise) return refreshPromise;

        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) return false;

        refreshPromise = (async () => {
            try {
                console.log("[Auth] Attempting singleton refresh...");
                // Use native fetch to avoid circular dependency with apiClient.request
                const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                });

                if (!response.ok) throw new Error("Refresh failed");

                const data = await response.json();
                if (data.success && data.data?.idToken) {
                    console.log("[Auth] Refresh successful");
                    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.data.idToken);
                    return true;
                }
                return false;
            } catch (error) {
                console.error("[Auth] Refresh failed", error);
                return false;
            } finally {
                refreshPromise = null;
            }
        })();

        return refreshPromise;
    },

    /**
     * Logout user
     */
    logout(): void {
        localStorage.clear();
    },

    /**
     * Check if user is authenticated (and try to refresh if expired)
     */
    async checkAuthStatus(): Promise<boolean> {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) return false;

        // Check if token is valid
        if (!this.isTokenExpired(token)) {
            return true;
        }

        // Attempt refresh if expired
        return this.refreshSession();
    },

    /**
     * Check if user is authenticated (synchronous check only)
     */
    isAuthenticated(): boolean {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) return false;
        return !this.isTokenExpired(token);
    },

    /**
     * Get stored user data
     */
    getStoredUser(): User | null {
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
    },

    /**
     * Store user data
     */
    storeUser(user: User): void {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    },
};
