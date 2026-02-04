"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { CheckCircle, Loader2, ArrowLeft, Clock, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { format } from "date-fns";
import { formatNexaAmount } from "@/lib/utils/format";

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { loading: authLoading } = useAuth();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchOrder = async () => {
            try {
                // Using the specific confirm endpoint as it returns order details securely
                const res = await apiClient.get<any>(`/orders/${id}/confirm`);
                if (res.success) {
                    setOrder(res.data.order);
                } else {
                    setError("Failed to load order");
                }
            } catch (err: any) {
                setError(err.message || "Error fetching order");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (authLoading || loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500 space-y-4">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            <p>Loading Order Details...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 text-center space-y-4">
            <div className="text-red-500 text-lg">Error: {error}</div>
            <button onClick={() => router.back()} className="text-blue-500 hover:underline">Go Back</button>
        </div>
    );

    if (!order) return <div className="p-10 text-center">Order not found</div>;

    const isSuccess = order.status === "PAYMENT_SUCCESS" || order.status === "ADMIN_APPROVED" || order.status === "RELEASE_PAYMENT";
    const isRejected = order.status === "REJECTED";
    const isPending = order.status === "VERIFICATION_PENDING" || order.status === "VERIFYING";

    return (
        <div className="max-w-md mx-auto space-y-6 pt-8 px-4 pb-20">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Link href="/users/ledger" className="text-gray-400 hover:text-white p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-white">Order Details</h1>
            </div>

            {/* Status Card */}
            <div className="bg-[#1a1b23] rounded-2xl p-8 shadow-xl border border-gray-800 space-y-6 flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isSuccess ? "bg-green-500/10 text-green-500" :
                    isRejected ? "bg-red-500/10 text-red-500" :
                        "bg-yellow-500/10 text-yellow-500"
                    }`}>
                    {isSuccess ? <CheckCircle size={40} /> :
                        isRejected ? <XCircle size={40} /> :
                            <Clock size={40} />}
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isSuccess ? "Payment Successful" :
                            isRejected ? "Order Rejected" :
                                "Processing Payment"}
                    </h2>
                </div>


                <div className="bg-[#0f1016] p-4 rounded-lg w-full text-left space-y-3 border border-gray-800">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Order ID</span>
                        <span className="text-gray-300 font-mono text-xs">{order.id}</span>
                    </div>
                    {order.transactionId && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Ref ID</span>
                            <span className="text-gray-300 font-mono text-xs">{order.transactionId}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date</span>
                        <span className="text-gray-300">{format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}</span>
                    </div>
                    {order.nexaAddress && (
                        <div className="pt-2 border-t border-gray-800/50 space-y-1">
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Destination Wallet</span>
                            <div className="flex items-start gap-2">
                                <span className="text-[10px] font-mono text-gray-400 break-all flex-1 line-clamp-2">
                                    {order.nexaAddress}
                                </span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(order.nexaAddress!)}
                                    className="p-1 px-2 bg-gray-800 hover:bg-gray-700 rounded text-[10px] text-gray-400 shrink-0"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="h-px bg-gray-800 my-2" />
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Amount Paid</span>
                        <span className="text-white font-medium">₹{order.amountINR.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">NEXA Received</span>
                        <span className="text-green-400 font-medium">{formatNexaAmount(order.nexaAmount)} NEXA</span>
                    </div>
                </div>

                {isRejected && (
                    <div className="flex items-start gap-2 text-xs text-left bg-red-500/5 p-3 rounded-lg border border-red-500/10 w-full text-red-400">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <p>If you believe this is a mistake or if you have already paid, please contact support with your Order ID.</p>
                    </div>
                )}
            </div>

            <div className="text-center">
                <Link href="/users/home" className="text-blue-500 hover:text-blue-400 text-sm font-medium">
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
}
