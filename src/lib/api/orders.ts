import { apiClient } from "./client";
import { Order } from "@/types/order";

export const OrdersApi = {
    createOrder: async (amountINR: number, nexaAddress?: string) => {
        return apiClient.post<{ orderId: string }>("/orders", { amountINR, nexaAddress });
    },

    getOrder: async (id: string) => {
        return apiClient.get<{ order: Order }>(`/orders/${id}`);
    },

    getPaymentDetails: async (id: string) => {
        return apiClient.get<{ order: Order; upiString: string }>(`/orders/${id}/confirm`);
    },

    confirmPayment: async (id: string) => {
        return apiClient.post<Order>(`/orders/${id}/confirm`, {});
    }
};
