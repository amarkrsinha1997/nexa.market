"use client";

import { useState, useEffect } from "react";
import { ArrowDown, IndianRupee, Wallet, Loader2, Copy } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { OrdersApi } from "@/lib/api/orders";
import { UserApi } from "@/lib/api/user";
import { useNexaPrice } from "@/lib/hooks/useNexaPrice";
import { formatNexaAmount } from "@/lib/utils/format";
import { useAuth } from "@/lib/hooks/useAuth";
import NexaAddressInput from "@/components/ui/NexaAddressInput";
import { MixpanelUtils } from "@/lib/utils/mixpanel";
import { MixpanelEvents } from "@/lib/config/mixpanel-events";
import { useToast } from "@/lib/hooks/useToast";

interface ExchangeFormProps { }

export default function ExchangeForm(props: ExchangeFormProps) {
    const router = useRouter();
    const [amount, setAmount] = useState<string>("");
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [nexaAddress, setNexaAddress] = useState("");
    const [isWalletValid, setIsWalletValid] = useState(false);
    const [isEditingWallet, setIsEditingWallet] = useState(false);
    const [isSavingWallet, setIsSavingWallet] = useState(false);

    const { user, refetch } = useAuth();
    const nexaPrice = useNexaPrice(); // Use the hook for automatic price updates
    const { toast } = useToast();

    // Load initial wallet from user profile
    useEffect(() => {
        if (user?.nexaWalletAddress) {
            setNexaAddress(user.nexaWalletAddress);
            setIsWalletValid(true);
        }
    }, [user]);

    // Price is INR per NEXA. So Amount / Price = Nexa Count
    // Example: 500 INR / 0.00005 = 10,000,000

    const calculateNexa = (inr: number) => {
        if (!nexaPrice) return 0;
        return inr / nexaPrice;
    };

    const estimatedNexa = amount ? formatNexaAmount(calculateNexa(parseFloat(amount))) : "0";

    const handleBuyNexa = async () => {
        if (!amount || !nexaAddress) return;
        setCreatingOrder(true);
        try {
            // Send nexaAddress explicitly to freeze it for this order
            const res = await OrdersApi.createOrder(parseFloat(amount), nexaAddress);
            if (res.success && res.data?.orderId) {
                router.push(`/users/payment/${res.data.orderId}`);
            }
        } catch (error) {
            console.error("Order failed", error);
            toast.error("Failed to create order");
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
                            min="1"
                            step="1"
                            value={amount}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Only allow whole numbers (no decimals)
                                if (value === '' || /^\d+$/.test(value)) {
                                    setAmount(value);
                                    if (value) {
                                        MixpanelUtils.track(MixpanelEvents.EXCHANGE_FORM_AMOUNT_ENTERED, { amount: value });
                                    }
                                }
                            }}
                            onBlur={(e) => {
                                // Round to whole number if somehow a decimal got in
                                if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                                    const rounded = Math.round(parseFloat(e.target.value));
                                    setAmount(rounded > 0 ? rounded.toString() : '');
                                }
                            }}
                            placeholder="0"
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
                <div className="text-right">
                    <div>10,000,000 NEXA ≈ ₹{(nexaPrice ? nexaPrice * 10000000 : 500).toFixed(0)}</div>
                    <div>1 INR ≈ {(nexaPrice ? (1 / nexaPrice) : 20000).toLocaleString(undefined, { maximumFractionDigits: 2 })} NEXA</div>
                </div>
            </div>

            {/* Wallet Address Section */}
            <div className={`space-y-2 pt-2 border-t border-gray-800 ${!amount ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Destination Wallet</label>
                    <button
                        onClick={async () => {
                            if (!isEditingWallet) {
                                setIsEditingWallet(true);
                                MixpanelUtils.track(MixpanelEvents.EXCHANGE_FORM_WALLET_EDIT_CLICKED);
                                return;
                            }

                            // Done clicked
                            // Normalize strings for comparison (handle nulls/undefined)
                            const current = nexaAddress?.trim() || "";
                            const stored = user?.nexaWalletAddress?.trim() || "";

                            if (current !== stored) {
                                setIsSavingWallet(true);
                                try {
                                    await UserApi.updateProfile({ nexaWalletAddress: current });
                                    await refetch();
                                    MixpanelUtils.track(MixpanelEvents.EXCHANGE_FORM_WALLET_SAVED, { address: current });
                                } catch (error) {
                                    console.error("Failed to save wallet", error);
                                } finally {
                                    setIsSavingWallet(false);
                                }
                            }
                            setIsEditingWallet(false);
                        }}
                        disabled={isSavingWallet}
                        className="text-xs text-blue-500 hover:text-blue-400 disabled:opacity-50"
                    >
                        {isSavingWallet ? "Saving..." : (isEditingWallet ? "Done" : (nexaAddress ? "Change" : "Add Wallet"))}
                    </button>
                </div>

                {isEditingWallet ? (
                    <NexaAddressInput
                        value={nexaAddress}
                        onChange={(val, valid) => {
                            setNexaAddress(val);
                            setIsWalletValid(valid);
                        }}
                        showCopy
                    />
                ) : (
                    <div className="bg-[#0f1016] rounded-xl p-3 border border-gray-800 flex items-start gap-3">
                        <div className="bg-blue-500/10 p-2 rounded-lg shrink-0">
                            <Wallet size={18} className="text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            {nexaAddress ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <p className="text-white text-sm font-mono break-all">
                                            {nexaAddress}
                                        </p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(nexaAddress);
                                                toast.success("Address copied");
                                                MixpanelUtils.track(MixpanelEvents.EXCHANGE_FORM_WALLET_ADDRESS_COPIED);
                                            }}
                                            className="text-gray-500 hover:text-white shrink-0"
                                        >
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-500 text-sm italic">No wallet address set</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Pay Button */}
            <button
                onClick={() => { handleBuyNexa(); MixpanelUtils.track(MixpanelEvents.EXCHANGE_FORM_BUY_NEXA_CLICKED, { amount, estimatedNexa }); }}
                disabled={!amount || parseFloat(amount) < 1 || creatingOrder || !nexaAddress || !isWalletValid}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {creatingOrder ? <Loader2 className="animate-spin" /> : <><Wallet size={20} /> {nexaAddress ? "Buy Nexa" : "Add Wallet to Buy"}</>}
            </button>
        </div>
    );
}
