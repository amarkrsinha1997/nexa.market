import { apiClient } from "./client";

export const ConfigApi = {
    getConfig: async () => {
        return apiClient.get<{ price: number }>("/config");
    },

    updateConfig: async (pricePerCrore: number) => {
        return apiClient.post("/config", { pricePerCrore });
    }
};
