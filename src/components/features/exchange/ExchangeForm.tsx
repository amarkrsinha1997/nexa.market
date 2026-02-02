"use client";

import { useState } from "react";
import { ArrowDown, IndianRupee, Wallet, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";

interface ExchangeFormProps {
    rate: number;
}

export default function ExchangeForm({ rate }: ExchangeFormProps) {
    const router = useRouter();
    const [amount, setAmount] = useState<string>("");
    const [creatingOrder, setCreatingOrder] = useState(false);

    const estimatedNexa = amount ? (parseFloat(amount) * rate).toLocaleString() : "0";

    const handleBuyNexa = async () => {
        if (!amount) return;
        setCreatingOrder(true);
        try {
            const res = await apiClient.post<any>("/orders", { amountINR: parseFloat(amount) });
            if (res.success && res.data?.orderId) {
                router.push(`/users/payment/${res.data.orderId}`);
            }
        } catch (error) {
            console.error("Order failed", error);
            alert("Failed to create order");
        } finally {
            setCreatingOrder(false);
        }
    };

    return (
        <div className="bg-[#1a1b23] rounded-2xl p-6 shadow-xl border border-gray-800 space-y-6">
            {/* Pay Section */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">You Pay</label>
                <div className="bg-[#0f1016] rounded-xl p-4 flex items-center justify-between border border-gray-800 focus-within:border-blue-500 transition-colors">
                    <div className="flex-1">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="bg-transparent text-2xl font-bold text-white outline-none w-full placeholder-gray-600"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-[#2a2b36] px-3 py-1.5 rounded-lg">
                        <IndianRupee size={16} className="text-green-500" />
                        <span className="font-bold text-white">INR</span>
                    </div>
                </div>
            </div>

            {/* Arrow Divider */}
            <div className="flex justify-center -my-3 relative z-10">
                <div className="bg-[#2a2b36] p-2 rounded-full border border-gray-800">
                    <ArrowDown size={20} className="text-blue-500" />
                </div>
            </div>

            {/* Receive Section */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">You Receive</label>
                <div className="bg-[#0f1016] rounded-xl p-4 flex items-center justify-between border border-gray-800">
                    <div className="flex-1">
                        <span className={`text-2xl font-bold ${amount ? "text-white" : "text-gray-600"}`}>
                            {estimatedNexa}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#2a2b36] px-3 py-1.5 rounded-lg">
                        <div className="w-5 h-5 relative rounded-full overflow-hidden bg-white/10">
                            <Image
                                src="/nexa-logo.png"
                                alt="Nexa"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="font-bold text-white">NEXA</span>
                    </div>
                </div>
            </div>

            {/* Rate Info */}
            <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>Rate</span>
                <span>1 INR ≈ {rate} NEXA</span>
            </div>

            {/* Pay Button */}
            <button
                onClick={handleBuyNexa}
                disabled={!amount || parseFloat(amount) <= 0 || creatingOrder}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {creatingOrder ? <Loader2 className="animate-spin" /> : <><Wallet size={20} /> Buy Nexa</>}
            </button>
        </div>
    );
}
