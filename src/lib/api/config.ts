import { apiClient } from "./client";

export const ConfigApi = {
    getConfig: async () => {
        return apiClient.get<{ price: number; inrLimit: number }>("/config");
    },

    updateConfig: async (pricePerCrore?: number, inrLimit?: number) => {
        return apiClient.post("/config", { pricePerCrore, inrLimit });
    }
};
