"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { FileText, Coins, Filter } from "lucide-react";
import LedgerTable from "@/components/features/ledger/LedgerTable";
import LedgerList from "@/components/features/ledger/LedgerList";
import { Order } from "@/types/order";

type FilterType = "all" | "confirmed" | "verified" | "pending" | "released" | "rejected";

export default function LedgerPage({ adminView = false }: { adminView?: boolean }) {
    const [loadingMore, setLoadingMore] = useState(false);
    const [filter, setFilter] = useState<FilterType>(adminView ? "pending" : "all");

    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    // LoadingMore and Filter already declared above

    useEffect(() => {
        if (user) {
            fetchOrders(1);
        }
    }, [user, filter]);

    const fetchOrders = async (pageNum: number) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            // Build URL with status parameter for admins
            let url = `/orders?page=${pageNum}&limit=10`;
            if (adminView && filter !== "all" && (filter === "pending" || filter === "released" || filter === "rejected")) {
                url += `&status=${filter}`;
            }

            const res = await apiClient.get<{ orders: Order[], hasMore: boolean }>(url);
            if (res.success && res.data) {
                let filteredOrders = res.data.orders;

                // Client-side filtering only for non-admin views
                if (!adminView) {
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

    const handleCheckOrder = async (orderId: string) => {
        if (!user) return;
        try {
            const res = await apiClient.post<{ data: Order }>(`/admin/orders/${orderId}/check`, {});
            if (res.success && res.data) {
                // Update local state
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...res.data } : o));
            }
        } catch (error) {
            console.error("Failed to check order", error);
            alert("Failed to lock order. It might be locked by someone else.");
        }
    };

    const handleOrderDecision = async (orderId: string, decision: 'APPROVE' | 'REJECT', reason?: string) => {
        if (!user) return;
        try {
            const res = await apiClient.post<{ data: Order }>(`/admin/orders/${orderId}/decision`, {
                decision,
                reason
            });
            if (res.success && res.data) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...res.data } : o));
            }
        } catch (error) {
            console.error("Failed to submit decision", error);
            alert("Failed to submit decision.");
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
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient md:flex-wrap md:overflow-visible md:pb-0">
                    {!adminView ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setFilter("pending")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "pending"
                                    ? "bg-amber-500/20 text-amber-500 border border-amber-500/50"
                                    : "bg-[#1a1b23] text-gray-400 hover:bg-[#2a2b36] border border-gray-800"
                                    }`}
                            >
                                NEXA PENDING
                            </button>
                            <button
                                onClick={() => setFilter("released")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "released"
                                    ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/50"
                                    : "bg-[#1a1b23] text-gray-400 hover:bg-[#2a2b36] border border-gray-800"
                                    }`}
                            >
                                NEXA RELEASED
                            </button>
                            <button
                                onClick={() => setFilter("rejected")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "rejected"
                                    ? "bg-red-500/20 text-red-500 border border-red-500/50"
                                    : "bg-[#1a1b23] text-gray-400 hover:bg-[#2a2b36] border border-gray-800"
                                    }`}
                            >
                                REJECTED
                            </button>
                        </>
                    )}
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
                        <LedgerTable
                            orders={orders}
                            currentUser={user}
                            onCheck={handleCheckOrder}
                            onDecision={handleOrderDecision}
                        />
                    </div>

                    {/* Mobile View */}
                    <LedgerList
                        orders={orders}
                        currentUser={user}
                        onCheck={handleCheckOrder}
                        onDecision={handleOrderDecision}
                    />

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
