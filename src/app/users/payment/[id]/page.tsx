"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrdersApi } from "@/lib/api/orders";
import { CheckCircle, IndianRupee, Loader2, ArrowLeft, Wallet, Copy } from "lucide-react";
import Link from "next/link";
import PaymentQRCode from "@/components/features/payment/PaymentQRCode";
import UPICopy from "@/components/features/payment/UPICopy";
import PaymentDeeplink from "@/components/features/payment/PaymentDeeplink";
import PaymentConfirmation from "@/components/features/payment/PaymentConfirmation";
import { formatNexaAmount } from "@/lib/utils/format";

export default function PaymentPage() {
    const { id } = useParams();
    const router = useRouter();
    const { loading: authLoading } = useAuth();

    const [order, setOrder] = useState<any>(null);
    const [upiString, setUpiString] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchOrder = async () => {
            try {
                // Using the confirm endpoint which also acts as GET details
                const res = await OrdersApi.getPaymentDetails(id as string);
                if (res.success) {
                    setOrder(res.data?.order);
                    setUpiString(res.data?.upiString || "");
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

    const handleConfirmPayment = async () => {
        setConfirming(true);
        try {
            const res = await OrdersApi.confirmPayment(id as string);
            if (res.success) {
                // Fetch updated details as requested to ensure UI is in sync and validation is complete
                const detailsRes = await OrdersApi.getPaymentDetails(id as string);
                if (detailsRes.success && detailsRes.data) {
                    setOrder(detailsRes.data.order);
                }
            }
        } catch (err: any) {
            alert("Failed to confirm: " + err.message);
        } finally {
            setConfirming(false);
        }
    };

    useEffect(() => {
        if (order && order.status !== "ORDER_CREATED") {
            router.replace(`/users/orders/${id}`);
        }
    }, [order, id, router]);

    if (authLoading || loading) return <div className="p-10 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" /> Loading Order...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
    if (!order) return <div className="p-10 text-center">Order not found</div>;

    // Prevent render if redirecting (optional flickering might happen but safer)
    if (order.status !== "ORDER_CREATED") {
        return <div className="p-10 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" /> Redirecting...</div>;
    }

    return (
        <div className="max-w-md mx-auto space-y-4 pt-4 px-4 pb-20">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
                <ArrowLeft size={16} /> Back
            </button>

            <div className="bg-[#1a1b23] rounded-2xl p-6 shadow-xl border border-gray-800 space-y-6 text-center">
                <div className="space-y-3">
                    <div className="space-y-1">
                        <p className="text-gray-400 text-sm uppercase tracking-wider">Total Payable</p>
                        <div className="flex items-center justify-center gap-1 text-3xl font-bold text-green-500">
                            <IndianRupee size={24} />
                            {order.amountINR}
                        </div>
                    </div>

                    {/* NEXA Amount Display */}
                    <div className="bg-[#0f1016] rounded-lg p-2 border border-gray-800">
                        <p className="text-gray-500 text-[10px] mb-0.5">You will receive</p>
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-lg font-bold text-blue-600">
                                {formatNexaAmount(order.nexaAmount)}
                            </span>
                            <span className="text-xs font-medium text-gray-400">NEXA</span>
                        </div>
                    </div>
                </div>

                {/* Destination Wallet */}
                {order.nexaAddress && (
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 space-y-2">
                        <label className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest flex items-center justify-center gap-1.5">
                            <Wallet size={10} />
                            Destination Wallet
                        </label>
                        <div className="flex items-center gap-2 bg-[#0f1016]/50 p-2 rounded-lg border border-gray-800/50">
                            <p className="text-white text-xs font-mono break-all flex-1 text-center line-clamp-2">
                                {order.nexaAddress}
                            </p>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(order.nexaAddress!);
                                }}
                                className="shrink-0 p-1.5 hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 rounded transition-colors"
                                title="Copy Address"
                            >
                                <Copy size={12} />
                            </button>
                        </div>
                    </div>
                )}

                {/* QR Code */}
                <PaymentQRCode upiString={upiString} />
                <p className="text-xs text-gray-500">Scan using any UPI App (GPay, PhonePe, Paytm)</p>

                {/* UPI Details */}
                <UPICopy upiId={order.paymentQrId} />

                {/* Actions */}
                <div className="space-y-3">
                    <PaymentDeeplink upiString={upiString} />
                    <PaymentConfirmation onConfirm={handleConfirmPayment} confirming={confirming} />
                </div>
            </div>
        </div>
    );
}
