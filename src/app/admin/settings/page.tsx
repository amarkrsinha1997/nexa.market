"use client";

import { useState } from "react";
import { LocalStorageUtils } from "@/lib/utils/storage";
import { useRouter } from "next/navigation";
import { ArrowLeft, Monitor, Save, ChevronDown, ChevronUp } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function AdminSettingsPage() {
    const router = useRouter();
    const [pricePerCrore, setPricePerCrore] = useState<string>("");
    const [calculating, setCalculating] = useState(false);
    const [priceAccordionOpen, setPriceAccordionOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Derived value
    const pricePerNexa = pricePerCrore ? (parseFloat(pricePerCrore) / 10000000).toFixed(6) : "0.000000";

    const switchToUserView = () => {
        LocalStorageUtils.setPreferredView("user");
        router.push("/users/home");
    };

    const handleSavePrice = async () => {
        if (!pricePerCrore) return;
        setLoading(true);
        try {
            await apiClient.post("/config/nexa-price", { pricePerCrore: parseFloat(pricePerCrore) });
            // Show success toast or feedback (omitted for brevity)
            alert("Price updated successfully!");
        } catch (error) {
            console.error("Failed to update price", error);
            alert("Failed to update price.");
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
                {/* Price Configuration Accordion */}
                <div className="bg-[#1a1b23] rounded-2xl border border-gray-800 overflow-hidden">
                    <button
                        onClick={() => setPriceAccordionOpen(!priceAccordionOpen)}
                        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    >
                        <div>
                            <h2 className="text-lg font-semibold text-white">Price Configuration</h2>
                            <p className="text-gray-400 text-sm">Set the base price for Nexa tokens</p>
                        </div>
                        {priceAccordionOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                    </button>

                    {priceAccordionOpen && (
                        <div className="p-6 pt-0 border-t border-gray-800 mt-4">
                            <div className="space-y-6 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Price per Crore (INR)</label>
                                    <input
                                        type="number"
                                        value={pricePerCrore}
                                        onChange={(e) => setPricePerCrore(e.target.value)}
                                        placeholder="e.g. 50000"
                                        className="w-full bg-[#0f1016] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                <div className="bg-[#0f1016] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Calculated Price (1 Nexa)</span>
                                    <span className="text-xl font-mono text-emerald-400">₹{pricePerNexa}</span>
                                </div>

                                <button
                                    onClick={handleSavePrice}
                                    disabled={loading || !pricePerCrore}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? "Saving..." : <><Save size={18} /> Update Price</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* View Preferences */}
                <div className="bg-[#1a1b23] rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="text-lg font-semibold text-white">View Preferences</h2>
                        <p className="text-gray-400 text-sm mt-1">Manage how you view the application.</p>
                    </div>

                    <div className="p-6">
                        <button
                            onClick={switchToUserView}
                            className="w-full bg-[#0f1016] border border-gray-700 hover:border-blue-500 hover:bg-gray-900 text-left p-4 rounded-xl flex items-center justify-between group transition-all"
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
                </div>
            </div>
        </div>
    );
}
