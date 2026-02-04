
import { User } from "@prisma/client";
import { LocalStorageUtils } from "@/lib/utils/storage";

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
        // Implement if you have a refresh token flow. 
        // For now, with 30-day tokens, simple existence check or manual re-login might be enough.
        // But if we want to use the /api/auth/refresh endpoint:
        // We'd need to store refreshToken too. (Login API returns it).

        // Let's assume for now we just check if we have a token.
        return !!LocalStorageUtils.getToken();
    },

    logout: () => {
        LocalStorageUtils.clearAuth();
    }
};
