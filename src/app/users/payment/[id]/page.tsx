"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { CheckCircle, IndianRupee, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import PaymentQRCode from "@/components/features/payment/PaymentQRCode";
import UPICopy from "@/components/features/payment/UPICopy";
import PaymentDeeplink from "@/components/features/payment/PaymentDeeplink";
import PaymentConfirmation from "@/components/features/payment/PaymentConfirmation";

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
                const res = await apiClient.get<any>(`/orders/${id}/confirm`);
                if (res.success) {
                    setOrder(res.data.order);
                    setUpiString(res.data.upiString);
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
            const res = await apiClient.post<any>(`/orders/${id}/confirm`, {});
            if (res.success) {
                setOrder(res.data.order); // Update local state to show status change
            }
        } catch (err: any) {
            alert("Failed to confirm: " + err.message);
        } finally {
            setConfirming(false);
        }
    };

    if (authLoading || loading) return <div className="p-10 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" /> Loading Order...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
    if (!order) return <div className="p-10 text-center">Order not found</div>;

    const isVerificationPending = order.status === "VERIFICATION_PENDING";
    const isVerified = order.status === "VERIFIED";
    const isPaymentSuccess = order.status === "PAYMENT_SUCCESS";

    if (isVerificationPending || isVerified || isPaymentSuccess) {
        return (
            <div className="max-w-md mx-auto space-y-6 pt-8 text-center px-4">
                <div className="bg-[#1a1b23] rounded-2xl p-8 shadow-xl border border-gray-800 space-y-6 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Payment Submitted</h1>
                        <p className="text-gray-400 text-sm">
                            Your payment is being verified by the admin. <br />
                            Once verified, your <b>{order.nexaAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} NEXA</b> tokens will be released.
                        </p>
                    </div>
                    <div className="bg-[#0f1016] p-4 rounded-lg w-full text-left space-y-2 border border-gray-800">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Order ID</span>
                            <span className="text-gray-300 font-mono text-xs">{order.id.slice(0, 8)}...</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status</span>
                            <span className={`font-bold ${isPaymentSuccess ? 'text-green-500' : isVerified ? 'text-blue-500' : 'text-yellow-500'}`}>
                                {order.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>
                    <Link href="/users/home" className="text-blue-500 hover:text-blue-400 text-sm font-medium">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
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
                        <div className="flex items-center justify-center gap-1 text-3xl font-bold text-white">
                            <IndianRupee size={24} />
                            {order.amountINR}
                        </div>
                    </div>

                    {/* NEXA Amount Display */}
                    <div className="bg-[#0f1016] rounded-lg p-3 border border-gray-800">
                        <p className="text-gray-500 text-xs mb-1">You will receive</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xl font-bold text-green-400">
                                {order.nexaAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-sm font-medium text-gray-400">NEXA</span>
                        </div>
                    </div>
                </div>

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
