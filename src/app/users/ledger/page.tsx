"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { FileText, Coins, Filter, AlertTriangle, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import LedgerTable from "@/components/features/ledger/LedgerTable";
import LedgerList from "@/components/features/ledger/LedgerList";
import LedgerSkeleton from "@/components/skeletons/LedgerSkeleton";
// import PendingPaymentsTable from "@/components/admin/PendingPaymentsTable"; // Removed: Unified view
import { Order } from "@/types/order";

import { MixpanelUtils } from "@/lib/utils/mixpanel";
import { MixpanelEvents } from "@/lib/config/mixpanel-events";
import { useToast } from "@/lib/hooks/useToast";

type FilterType = "all" | "confirmed" | "verified" | "pending" | "released" | "rejected" | "transfer_failed";

export default function LedgerPage({ adminView = false }: { adminView?: boolean }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get("tab") as FilterType;

    const [loadingMore, setLoadingMore] = useState(false);
    const [filter, setFilter] = useState<FilterType>(tabParam || (adminView ? "pending" : "all"));

    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Sync state with URL param if it changes externally
    useEffect(() => {
        if (tabParam && tabParam !== filter) {
            setFilter(tabParam);
        }
    }, [tabParam]);

    const updateFilter = (newFilter: FilterType) => {
        setFilter(newFilter);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", newFilter);
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

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
            if (adminView) {
                url += `&adminView=true`;
                if (filter !== "all") {
                    url += `&status=${filter}`;
                }
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
                MixpanelUtils.track(MixpanelEvents.ADMIN_ORDER_CHECK_CLICKED, { orderId });
                // Refetch to ensure UI consistency with backend
                await fetchOrders(1);
            }
        } catch (error) {
            console.error("Failed to check order", error);
            toast.error("Failed to lock order. It might be locked by someone else.");
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
                MixpanelUtils.track(MixpanelEvents.ADMIN_ORDER_DECISION_MADE, { orderId, decision, reason });
                // Success case
            }
        } catch (error) {
            console.error("Failed to submit decision", error);
            toast.error("Failed to submit decision");
        } finally {
            // Always refetch to ensure UI consistency (e.g. failure reason, lifecycle updates)
            await fetchOrders(1);
        }
    };

    const handleReprocessPayment = async (orderId: string) => {
        try {
            const res = await apiClient.post(`/admin/orders/${orderId}/reprocess-payment`, {});
            if (res.success) {
                MixpanelUtils.track(MixpanelEvents.ADMIN_ORDER_REPROCESS_CLICKED, { orderId });
                toast.success("Payment retry initiated successfully");
            } else {
                toast.error(`Failed: ${res.message}`);
            }
        } catch (error) {
            console.error("Reprocess failed", error);
            toast.error("Reprocess failed. Check console");
        } finally {
            // Always refetch to reflect latest failure reason or status
            await fetchOrders(1);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchOrders(page + 1);
        }
    };

    const isRefreshing = loading && orders.length > 0;

    if (authLoading || (loading && orders.length === 0)) return (
        <div className="max-w-7xl mx-auto space-y-4 pt-4 pb-12">
            <header className="px-4 md:px-0 space-y-4">
                <h1 className="text-2xl font-bold text-white">Ledger</h1>
            </header>
            <LedgerSkeleton />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-4 pt-4 pb-12">
            <header className="px-4 md:px-0 space-y-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    Ledger
                    {isRefreshing && <Loader2 size={16} className="animate-spin text-blue-500 ml-2" />}
                </h1>

                {/* Filter Buttons */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient md:flex-wrap md:overflow-visible md:pb-0">
                    {!adminView ? (
                        // User View: No filters, just title
                        <div />
                    ) : (
                        <>
                            <button
                                onClick={() => { updateFilter("pending"); MixpanelUtils.track(MixpanelEvents.LEDGER_FILTER_PENDING_CLICKED, { filter: "pending" }); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "pending"
                                    ? "bg-amber-500/20 text-amber-500 border border-amber-500/50"
                                    : "bg-[#1a1b23] text-gray-400 hover:bg-[#2a2b36] border border-gray-800"
                                    }`}
                            >
                                NEXA PENDING
                            </button>
                            <button
                                onClick={() => { updateFilter("transfer_failed"); MixpanelUtils.track(MixpanelEvents.LEDGER_FILTER_FAILED_CLICKED, { filter: "transfer_failed" }); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === "transfer_failed"
                                    ? "bg-orange-500/20 text-orange-500 border border-orange-500/50"
                                    : "bg-[#1a1b23] text-gray-400 hover:bg-[#2a2b36] border border-gray-800"
                                    }`}
                            >
                                <AlertTriangle size={14} />
                                TRANSFER PENDING
                            </button>
                            <button
                                onClick={() => { updateFilter("released"); MixpanelUtils.track(MixpanelEvents.LEDGER_FILTER_COMPLETED_CLICKED, { filter: "released" }); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "released"
                                    ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/50"
                                    : "bg-[#1a1b23] text-gray-400 hover:bg-[#2a2b36] border border-gray-800"
                                    }`}
                            >
                                NEXA RELEASED
                            </button>
                            <button
                                onClick={() => { updateFilter("rejected"); MixpanelUtils.track(MixpanelEvents.LEDGER_FILTER_ALL_CLICKED, { filter: "rejected" }); }}
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
                    <p className="text-gray-400 text-sm mt-2">
                        {filter === 'transfer_failed' ? "No pending transfers found." : "Any purchases or deposits will appear here."}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-6">
                        {/* Unified View for All Filters including Transfer Failed */}

                        {/* Unified Card View */}
                        <LedgerList
                            orders={orders}
                            currentUser={user}
                            onCheck={handleCheckOrder}
                            onDecision={handleOrderDecision}
                            onReprocess={handleReprocessPayment}
                        />



                        {hasMore && (
                            <div className="flex justify-center pb-8">
                                <button
                                    onClick={() => { handleLoadMore(); MixpanelUtils.track(MixpanelEvents.LEDGER_LOAD_MORE_CLICKED, { page }); }}
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
                </div>
            )}
        </div>
    );
}
