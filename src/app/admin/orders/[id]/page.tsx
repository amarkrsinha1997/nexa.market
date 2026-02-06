"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Order } from "@/types/order";
import { formatCurrency } from "@/lib/utils/format";
import { Loader2, ArrowLeft, User as UserIcon, Calendar, Wallet, CheckCircle, XCircle, Clock, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { format } from "date-fns";
import { MixpanelUtils } from "@/lib/utils/mixpanel";
import { MixpanelEvents } from "@/lib/config/mixpanel-events";
import { useToast } from "@/lib/hooks/useToast";

export default function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);

    // Unwrap params
    const resolvedParams = use(params);
    const orderId = resolvedParams.id;

    useEffect(() => {
        if (!authLoading && user) {
            if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
                router.push("/users/home");
                return;
            }
            fetchOrder();
        }
    }, [user, authLoading, orderId]);

    const fetchOrder = async () => {
        try {
            const res = await apiClient.get<{ order: Order }>(`/orders/${orderId}`);
            if (res.success && res.data) {
                setOrder(res.data.order);
            } else {
                setError("Order not found");
            }
        } catch (err: any) {
            setError(err.message || "Failed to load order");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'check' | 'approve' | 'reject', reason?: string) => {
        if (!confirm(`Are you sure you want to ${action} this order?`)) return;
        setProcessing(true);
        try {
            let res;
            if (action === 'check') {
                res = await apiClient.post(`/admin/orders/${orderId}/check`, {});
            } else {
                res = await apiClient.post(`/admin/orders/${orderId}/decision`, {
                    decision: action.toUpperCase(),
                    reason
                });
            }

            if (res.success) {
                await fetchOrder();
            } else {
                toast.error(res.message || "Action failed");
            }
        } catch (err: any) {
            toast.error(err.message || "Action failed");
        } finally {
            setProcessing(false);
        }
    };

    if (authLoading || loading) return (
        <div className="flex h-screen items-center justify-center bg-[#0f1016] text-gray-500">
            <Loader2 className=" animate-spin mr-2" /> Loading...
        </div>
    );

    if (error || !order) return (
        <div className="flex bg-[#0f1016] min-h-screen flex-col items-center justify-center text-white space-y-4">
            <h1 className="text-xl text-red-500">{error || "Order not found"}</h1>
            <Link href="/admin/ledger" className="text-blue-500 hover:underline">Back to Ledger</Link>
        </div>
    );

    const userDetails = (order as any).user || {}; // Cast as any because Order type might not explicitly include user relation in frontend types yet

    return (
        <div className="min-h-screen bg-[#0f1016] p-4 md:p-8 text-white space-y-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin/ledger" className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">Order Details</h1>
                            <StatusBadge status={order.status} />
                        </div>
                        <p className="text-gray-500 text-sm font-mono mt-1">#{order.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Order Info & Lifecycle */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Summary Card */}
                        <div className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Wallet size={18} className="text-blue-500" />
                                Payment Information
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                    <p className="text-xs text-gray-500 uppercase">Amount (INR)</p>
                                    <p className="text-xl font-bold text-white mt-1">{formatCurrency(order.amountINR)}</p>
                                </div>
                                <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                    <p className="text-xs text-gray-500 uppercase">Nexa Amount</p>
                                    <p className="text-xl font-bold text-nexa-primary mt-1">{order.nexaAmount.toLocaleString()} NEX</p>
                                </div>
                                <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                    <p className="text-xs text-gray-500 uppercase">Price</p>
                                    <p className="text-lg font-medium text-gray-300 mt-1">₹{order.nexaPrice.toFixed(6)}</p>
                                </div>
                                <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                    <p className="text-xs text-gray-500 uppercase">Created</p>
                                    <p className="text-sm font-medium text-gray-300 mt-1">
                                        {format(new Date(order.createdAt), "dd MMM, HH:mm")}
                                    </p>
                                </div>
                            </div>
                            {order.transactionId && (
                                <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg flex justify-between items-center">
                                    <span className="text-sm text-gray-400">User Transaction Ref:</span>
                                    <span className="font-mono text-blue-400 select-all">{order.transactionId}</span>
                                </div>
                            )}
                        </div>

                        {/* Lifecycle Timeline */}
                        <div className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Clock size={18} className="text-purple-500" />
                                Lifecycle Timeline
                            </h2>
                            <div className="space-y-6 relative pl-2">
                                {/* Vertical Line */}
                                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-800" />

                                {(order.lifecycle as any[])?.map((event, index) => (
                                    <div key={index} className="relative pl-8">
                                        {/* Dot */}
                                        <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-[#1a1b23] ${event.status === 'RELEASE_PAYMENT' ? 'bg-green-500' :
                                            event.status === 'REJECTED' ? 'bg-red-500' :
                                                event.status === 'ADMIN_APPROVED' ? 'bg-blue-500' :
                                                    'bg-gray-600'
                                            }`} />

                                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/50">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-gray-200">{event.action.replace(/_/g, " ")}</span>
                                                <span className="text-xs text-gray-500">{format(new Date(event.timestamp), "HH:mm, dd MMM")}</span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-2">{event.note}</p>

                                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-800/50">
                                                {event.actorPicture ? (
                                                    <img src={event.actorPicture} alt="" className="w-5 h-5 rounded-full" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-gray-700" />
                                                )}
                                                <span className="text-xs text-gray-500">
                                                    {event.actorName || event.actorEmail || "System"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: User & Actions */}
                    <div className="space-y-6">
                        {/* User Profile */}
                        <div className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <UserIcon size={18} className="text-gray-400" />
                                User Details
                            </h2>
                            <div className="flex flex-col items-center text-center mb-6">
                                {userDetails.picture ? (
                                    <img src={userDetails.picture} alt="" className="w-20 h-20 rounded-full mb-3 border-2 border-gray-700" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-800 mb-3 flex items-center justify-center">
                                        <UserIcon size={32} className="text-gray-600" />
                                    </div>
                                )}
                                <h3 className="font-bold text-lg">{userDetails.name || "Unknown User"}</h3>
                                <p className="text-sm text-gray-400">{userDetails.email}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-800">
                                    <span className="text-sm text-gray-500">Phone</span>
                                    <span className="text-sm">{userDetails.phoneNumber || "-"}</span>
                                </div>
                                <div className="py-2">
                                    <span className="text-sm text-gray-500 block mb-1">Wallet Address</span>
                                    <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-lg border border-gray-800">
                                        <code className="text-xs text-blue-400 break-all select-all">
                                            {userDetails.nexaWalletAddress || "-"}
                                        </code>
                                    </div>
                                </div>
                            </div>
                            <Link href={`/admin/users/${order.userId}`} className="block mt-4 text-center text-sm text-blue-500 hover:underline">
                                View Full Profile
                            </Link>
                        </div>

                        {/* Admin Actions */}
                        <div className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ShieldCheck size={18} className="text-emerald-500" />
                                Actions
                            </h2>

                            {order.status === "VERIFICATION_PENDING" && (
                                <button
                                    onClick={() => { handleAction('check'); MixpanelUtils.track(MixpanelEvents.ADMIN_ORDER_CHECK_LOCKED, { orderId: order.id }); }}
                                    disabled={processing}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : 'Verify & Lock Order'}
                                </button>
                            )}

                            {order.status === "VERIFYING" && (order.checkedBy === user?.id || user?.role === 'SUPERADMIN') && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => { handleAction('approve'); MixpanelUtils.track(MixpanelEvents.ADMIN_ORDER_PAYMENT_APPROVED, { orderId: order.id, amount: order.amountINR }); }}
                                        disabled={processing}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        Approve Payment
                                    </button>
                                    <button
                                        onClick={() => {
                                            const reason = prompt("Reason for rejection:");
                                            if (reason) {
                                                handleAction('reject', reason);
                                                MixpanelUtils.track(MixpanelEvents.ADMIN_ORDER_REJECTED, { orderId: order.id, reason });
                                            }
                                        }}
                                        disabled={processing}
                                        className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 font-medium py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} />
                                        Reject Order
                                    </button>
                                </div>
                            )}

                            {order.status === "VERIFYING" && order.checkedBy !== user?.id && user?.role !== 'SUPERADMIN' && (
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-sm text-center">
                                    Locked by another admin
                                </div>
                            )}

                            {!["VERIFICATION_PENDING", "VERIFYING"].includes(order.status) && (
                                <div className="text-center text-gray-500 text-sm py-2">
                                    No actions available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
