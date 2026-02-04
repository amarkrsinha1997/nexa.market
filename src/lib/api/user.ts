
import { User } from "@prisma/client";
import { LocalStorageUtils } from "@/lib/utils/storage";

const API_BASE_URL = "/api";

export const UserApi = {
    getProfile: async (): Promise<User> => {
        const token = LocalStorageUtils.getToken();
        if (!token) throw new Error("No auth token");

        const res = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to fetch profile");
        }

        const user = data.data.user;
        // Auto-update storage
        LocalStorageUtils.setUser(user);

        return user;
    },

    updateProfile: async (updates: Partial<User>): Promise<User> => {
        const token = LocalStorageUtils.getToken();
        if (!token) throw new Error("No auth token");

        const res = await fetch(`${API_BASE_URL}/user/profile`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to update profile");
        }

        const updatedUser = data.data.user;
        // Auto-update storage
        LocalStorageUtils.setUser(updatedUser);

        return updatedUser;
    }
};
