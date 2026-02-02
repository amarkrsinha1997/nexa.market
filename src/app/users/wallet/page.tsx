"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import NexaAddressInput from "@/components/ui/NexaAddressInput";
import BackButton from "@/components/ui/BackButton";
import { Save, Wallet } from "lucide-react";

export default function WalletPage() {
    const { user, loading, checkAuth } = useAuth();
    const [address, setAddress] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Load initial address
    useEffect(() => {
        if (user?.nexaWalletAddress) {
            setAddress(user.nexaWalletAddress);
            setIsValid(true); // Assuming stored address is valid
        }
    }, [user]);

    const handleSave = async () => {
        if (!isValid || !address) return;
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await apiClient.patch<{ user: any }>("/user/profile", {
                nexaWalletAddress: address
            });

            if (res.success) {
                setMessage({ type: 'success', text: "Wallet address updated successfully!" });
                await checkAuth(); // Refresh local user state
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Failed to update wallet address" });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

    return (
        <div className="max-w-md mx-auto space-y-6 pt-8 relative">
            <div className="absolute top-0 left-0">
                <BackButton />
            </div>

            <header className="text-center space-y-1 mt-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-4">
                    <Wallet className="text-blue-500" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-white">Your Wallet</h1>
                <p className="text-gray-400 text-sm">Manage your Nexa destination address</p>
            </header>

            <div className="bg-[#1a1b23] rounded-2xl p-6 shadow-xl border border-gray-800 space-y-6">

                <div className="space-y-4">
                    <NexaAddressInput
                        value={address}
                        onChange={(val, valid) => {
                            setAddress(val);
                            setIsValid(valid);
                        }}
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded text-sm text-center ${message.type === 'success' ? 'bg-green-900/20 text-green-300' : 'bg-red-900/20 text-red-300'}`}>
                        {message.text}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={!isValid || isSaving || address === user?.nexaWalletAddress}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isSaving ? "Saving..." : <><Save size={18} /> Update Wallet Address</>}
                </button>
            </div>

            <div className="text-center px-6">
                <p className="text-xs text-gray-500">
                    This address will be used for all future payouts. Please ensure it is correct and you own the private keys.
                </p>
            </div>
        </div>
    );
}
