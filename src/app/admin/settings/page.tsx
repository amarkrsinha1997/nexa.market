"use client";

import { useState, useEffect } from "react";
import { LocalStorageUtils } from "@/lib/utils/storage";
import { useRouter } from "next/navigation";
import { ArrowLeft, Monitor, Save, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { ConfigApi } from "@/lib/api/config";
import { useAuth } from "@/lib/hooks/useAuth";
import { MixpanelUtils } from "@/lib/utils/mixpanel";
import { useToast } from "@/lib/hooks/useToast";

export default function AdminSettingsPage() {
    const router = useRouter();
    const { logout } = useAuth();
    const { toast } = useToast();
    const [pricePerCrore, setPricePerCrore] = useState<string>("");
    const [calculating, setCalculating] = useState(false);
    const [priceAccordionOpen, setPriceAccordionOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fetchingPrice, setFetchingPrice] = useState(true);

    // Derived value
    const pricePerNexa = pricePerCrore ? (parseFloat(pricePerCrore) / 10000000).toFixed(6) : "0.000000";

    // Fetch current price on mount
    useEffect(() => {
        const fetchCurrentPrice = async () => {
            try {
                const res = await ConfigApi.getConfig();
                if (res.success && res.data?.price) {
                    // price is per Nexa, convert to per Crore
                    // Round to 2 decimal places to avoid floating-point precision issues
                    const pricePerCroreValue = Math.round(res.data.price * 10000000 * 100) / 100;
                    setPricePerCrore(pricePerCroreValue.toFixed(2));
                }
            } catch (error) {
                console.error("Failed to fetch current price", error);
            } finally {
                setFetchingPrice(false);
            }
        };
        fetchCurrentPrice();
    }, []);

    const switchToUserView = () => {
        LocalStorageUtils.setPreferredView("user");
        router.push("/users/home");
    };

    const handleSavePrice = async () => {
        if (!pricePerCrore) return;
        setLoading(true);
        try {
            // Round to 2 decimal places before sending to ensure INR precision
            const roundedPrice = Math.round(parseFloat(pricePerCrore) * 100) / 100;
            await ConfigApi.updateConfig(roundedPrice);
            toast.success("Price updated successfully!");
        } catch (error) {
            console.error("Failed to update price", error);
            toast.error("Failed to update price");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
            </header>

            <div className="space-y-6">
                {/* Price Configuration */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Price Configuration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Price per Crore (INR)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={pricePerCrore}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow empty or valid numbers with max 2 decimal places
                                    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                        setPricePerCrore(value);
                                    }
                                }}
                                onBlur={(e) => {
                                    // Format to 2 decimal places on blur
                                    if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                                        const formatted = parseFloat(e.target.value).toFixed(2);
                                        setPricePerCrore(formatted);
                                    }
                                }}
                                placeholder="e.g. 700.00"
                                className="w-full bg-[#1a1b23] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="bg-[#1a1b23] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Calculated Price (1 Nexa)</span>
                            <span className="text-xl font-mono text-emerald-400">₹{pricePerNexa}</span>
                        </div>

                        <button
                            onClick={() => { handleSavePrice(); MixpanelUtils.track("Admin Price Update Clicked", { pricePerCrore: pricePerCrore }); }}
                            disabled={loading || !pricePerCrore}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? "Saving..." : <><Save size={18} /> Update Price</>}
                        </button>
                    </div>
                </div>

                {/* View Preferences */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">View Preferences</h2>
                    <button
                        onClick={() => { switchToUserView(); MixpanelUtils.track("Switch View Clicked", { to: "User" }); }}
                        className="w-full bg-[#1a1b23] border border-gray-700 hover:border-blue-500 hover:bg-gray-900 text-left p-4 rounded-xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Monitor size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Switch to User View</h3>
                            </div>
                        </div>
                        <ArrowLeft className="rotate-180 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>
                </div>

                {/* Account Actions */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Account Actions</h2>
                    <button
                        onClick={() => { logout(); MixpanelUtils.track("Logout Clicked", { role: "Admin", source: "Settings Page" }); }}
                        className="w-full bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-left p-4 rounded-xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/10 rounded-lg text-red-500 transition-colors">
                                <LogOut size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-400">Log Out</h3>
                                <p className="text-sm text-red-400/70">End your current session</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
