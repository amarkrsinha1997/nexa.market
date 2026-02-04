
import { User } from "@prisma/client";
import { LocalStorageUtils } from "@/lib/utils/storage";
import { JwtUtils } from "@/lib/utils/jwt";

const API_BASE_URL = "/api";

interface GoogleLoginResponse {
    success: boolean;
    data: {
        user: User;
        isNewUser: boolean;
        accessToken: string;
        refreshToken?: string;
        idToken?: string;
    };
    message: string;
}

export const AuthApi = {
    loginWithGoogle: async (googleToken?: string, code?: string, referralCode?: string): Promise<GoogleLoginResponse> => {
        const res = await fetch(`${API_BASE_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ googleToken, code, referralCode }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Login failed");
        }

        // Auto-update storage
        if (data.data.accessToken) {
            LocalStorageUtils.setToken(data.data.accessToken);
        }
        if (data.data.refreshToken) {
            LocalStorageUtils.setRefreshToken(data.data.refreshToken);
        }
        if (data.data.user) {
            LocalStorageUtils.setUser(data.data.user);
        }

        return data;
    },

    checkAuthStatus: async (): Promise<boolean> => {
        const token = LocalStorageUtils.getToken();
        if (!token) return false;
        // Optionally verify token validity here if needed, or rely on API calls failing
        return true;
    },

    refreshSession: async (force: boolean = false): Promise<boolean> => {
        const token = LocalStorageUtils.getToken();
        if (!token) return false;

        // Check if current token is expired (skip if force=true)
        if (!force && !JwtUtils.isExpired(token)) {
            return true;
        }

        const refreshToken = LocalStorageUtils.getRefreshToken();
        if (!refreshToken) {
            AuthApi.logout();
            return false;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                // If refresh failed, logout user
                AuthApi.logout();
                return false;
            }

            // Update tokens
            if (data.data.accessToken) {
                LocalStorageUtils.setToken(data.data.accessToken);
            }
            // Optional: Backend might rotate refresh tokens too
            if (data.data.refreshToken) {
                LocalStorageUtils.setRefreshToken(data.data.refreshToken);
            }

            return true;
        } catch (error) {
            console.error("Token refresh failed", error);
            AuthApi.logout();
            return false;
        }
    },

    logout: () => {
        LocalStorageUtils.clearAuth();
    }
};
