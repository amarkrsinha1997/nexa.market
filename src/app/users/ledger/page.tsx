"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { FileText, Coins } from "lucide-react";
import LedgerTable from "@/components/features/ledger/LedgerTable";
import LedgerList from "@/components/features/ledger/LedgerList";
import { Order } from "@/types/order";

export default function LedgerPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await apiClient.get<{ orders: Order[] }>("/orders");
            if (res.success && res.data) {
                setOrders(res.data.orders);
            }
        } catch (error) {
            console.error("Failed to fetch ledger", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p>Loading ledger...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 pt-8 pb-20">
            <header className="px-4 md:px-0">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="text-blue-500" /> Transaction Ledger
                </h1>
                <p className="text-gray-400 text-sm mt-1">History of your payments and deposits</p>
            </header>

            {orders.length === 0 ? (
                <div className="bg-[#1a1b23] rounded-2xl p-12 text-center border border-gray-800 mx-4 md:mx-0">
                    <Coins className="mx-auto text-gray-600 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-white">No transactions yet</h3>
                    <p className="text-gray-400 text-sm mt-2">Any purchases or deposits will appear here.</p>
                </div>
            ) : (
                <div className="bg-[#1a1b23] rounded-2xl border border-gray-800 overflow-hidden mx-4 md:mx-0 shadow-xl">
                    <LedgerTable orders={orders} />
                    <LedgerList orders={orders} />
                </div>
            )}
        </div>
    );
}
