"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { FileText, Coins, Filter } from "lucide-react";
import LedgerTable from "@/components/features/ledger/LedgerTable";
import LedgerList from "@/components/features/ledger/LedgerList";
import { Order } from "@/types/order";

type FilterType = "all" | "confirmed" | "verified";

export default function LedgerPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filter, setFilter] = useState<FilterType>("all");

    useEffect(() => {
        if (user) {
            fetchOrders(1);
        }
    }, [user, filter]);

    const fetchOrders = async (pageNum: number) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const res = await apiClient.get<{ orders: Order[], hasMore: boolean }>(`/orders?page=${pageNum}&limit=10`);
            if (res.success && res.data) {
                let filteredOrders = res.data.orders;

                // Apply filter
                if (filter === "confirmed") {
                    filteredOrders = filteredOrders.filter(o =>
                        o.status === "VERIFICATION_PENDING" ||
                        o.status === "VERIFYING" ||
                        o.status === "VERIFIED" ||
                        o.status === "RELEASE_PAYMENT" ||
                        o.status === "PAYMENT_SUCCESS"
                    );
                } else if (filter === "verified") {
                    filteredOrders = filteredOrders.filter(o =>
                        o.status === "VERIFIED" ||
                        o.status === "RELEASE_PAYMENT" ||
                        o.status === "PAYMENT_SUCCESS"
                    );
                }

                if (pageNum === 1) {
                    setOrders(filteredOrders);
                } else {
                    setOrders(prev => [...prev, ...filteredOrders]);
                }
                setHasMore(res.data.hasMore);
                setPage(pageNum);
            }
        } catch (error) {
            console.error("Failed to fetch ledger", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchOrders(page + 1);
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
            <header className="px-4 md:px-0 space-y-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    Ledger
                </h1>

                {/* Filter Buttons */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all"
                                ? "bg-blue-600 text-white"
                                : "bg-[#1a1b23] text-gray-400 hover:bg-[#2a2b36] border border-gray-800"
                            }`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setFilter("confirmed")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "confirmed"
                                ? "bg-blue-600 text-white"
                                : "bg-[#1a1b23] text-gray-400 hover:bg-[#2a2b36] border border-gray-800"
                            }`}
                    >
                        Payment Confirmed
                    </button>
                    <button
                        onClick={() => setFilter("verified")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "verified"
                                ? "bg-blue-600 text-white"
                                : "bg-[#1a1b23] text-gray-400 hover:bg-[#2a2b36] border border-gray-800"
                            }`}
                    >
                        Admin Verified
                    </button>
                </div>
            </header>

            {orders.length === 0 ? (
                <div className="bg-[#1a1b23] rounded-2xl p-12 text-center border border-gray-800 mx-4 md:mx-0">
                    <Coins className="mx-auto text-gray-600 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-white">No transactions yet</h3>
                    <p className="text-gray-400 text-sm mt-2">Any purchases or deposits will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Desktop View */}
                    <div className="hidden md:block bg-[#1a1b23] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                        <LedgerTable orders={orders} />
                    </div>

                    {/* Mobile View */}
                    <LedgerList orders={orders} />

                    {hasMore && (
                        <div className="flex justify-center pb-8">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {loadingMore ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "Load More"
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
