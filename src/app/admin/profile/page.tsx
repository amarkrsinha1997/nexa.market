"use client";

import { useRole } from "@/lib/hooks/useRole";
import { useState, useEffect } from "react";
import PhoneInput from "@/components/ui/PhoneInput";
import NexaAddressInput from "@/components/ui/NexaAddressInput";
import { apiClient } from "@/lib/api/client";
import { MixpanelUtils } from "@/lib/utils/mixpanel";

export default function AdminProfilePage() {
    const { user, isSuperAdmin } = useRole();

    // State for editable fields
    const [phoneCountry, setPhoneCountry] = useState("+91");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [isWalletValid, setIsWalletValid] = useState(true);

    // Initialize from user data
    useEffect(() => {
        if (user?.phoneNumber) {
            // Extract country code and number
            const match = user.phoneNumber.match(/^(\+\d+)\s*(.*)$/);
            if (match) {
                setPhoneCountry(match[1]);
                setPhoneNumber(match[2]);
            }
        }
        if (user?.nexaWalletAddress) {
            setWalletAddress(user.nexaWalletAddress);
        }
    }, [user]);

    const [savingPhone, setSavingPhone] = useState(false);
    const [savingWallet, setSavingWallet] = useState(false);

    const handleSavePhone = async () => {
        if (!phoneNumber) return;
        setSavingPhone(true);
        try {
            const fullPhoneNumber = `${phoneCountry} ${phoneNumber}`;
            const res = await apiClient.patch("/user/profile", { phoneNumber: fullPhoneNumber });
            if (res.success) {
                alert("Phone number updated successfully");
            } else {
                alert("Failed to update phone number");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setSavingPhone(false);
        }
    };

    const handleSaveWallet = async () => {
        if (!walletAddress || !isWalletValid) return;
        setSavingWallet(true);
        try {
            const res = await apiClient.patch("/user/profile", { nexaWalletAddress: walletAddress });
            if (res.success) {
                alert("Wallet address updated successfully");
            } else {
                alert("Failed to update wallet address");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setSavingWallet(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-white">Admin Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-[#1a1b23] rounded-2xl p-4 border border-gray-800 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>

                        <div className="relative mb-3">
                            {user?.picture ? (
                                <img src={user.picture} alt={user.name || "Admin"} className="w-20 h-20 rounded-full border-4 border-[#0f1016] shadow-xl object-cover" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-4 border-[#0f1016] shadow-xl">
                                    {user?.name?.[0] || "A"}
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-4 border-[#1a1b23] rounded-full" title="Active"></div>
                        </div>

                        <h2 className="text-lg font-bold text-white mb-1">{user?.name}</h2>
                        <p className="text-gray-400 text-xs mb-3">{user?.email}</p>

                        <div className="flex gap-2 mb-4">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border ${isSuperAdmin
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                }`}>
                                {user?.role}
                            </span>
                            <span className="px-2 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                Active
                            </span>
                        </div>

                        <div className="w-full pt-3 border-t border-gray-800">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Member Since</div>
                            <div className="text-white text-sm font-medium">{user?.createdAt ? new Date(user.createdAt).getFullYear() : "-"}</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-2">
                    <div className="bg-[#1a1b23] rounded-2xl p-4 border border-gray-800 space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                            Account Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-[#0f1016] border border-gray-800/50">
                                <label className="text-[10px] text-gray-500 block mb-1 uppercase tracking-wider">User ID</label>
                                <div className="font-mono text-xs text-white break-all select-all">{user?.id || "N/A"}</div>
                            </div>

                            <div className="p-3 rounded-xl bg-[#0f1016] border border-gray-800/50">
                                <label className="text-[10px] text-gray-500 block mb-1 uppercase tracking-wider">Email Address</label>
                                <div className="text-xs text-white break-all">{user?.email}</div>
                            </div>

                            {user?.dateOfBirth && (
                                <div className="p-3 rounded-xl bg-[#0f1016] border border-gray-800/50">
                                    <label className="text-[10px] text-gray-500 block mb-1 uppercase tracking-wider">Date of Birth</label>
                                    <div className="text-xs text-white">{new Date(user.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                            )}

                            <div className="p-3 rounded-xl bg-[#0f1016] border border-gray-800/50">
                                <label className="text-[10px] text-gray-500 block mb-1 uppercase tracking-wider">Member Since</label>
                                <div className="text-xs text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "-"}</div>
                            </div>

                            <div className="p-3 rounded-xl bg-[#0f1016] border border-gray-800/50">
                                <label className="text-[10px] text-gray-500 block mb-1 uppercase tracking-wider">Status</label>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-xs text-white">Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Editable Phone Number */}
                        <div className="pt-3 border-t border-gray-800">
                            <div className="flex flex-col gap-2">
                                <PhoneInput
                                    countryCode={phoneCountry}
                                    phoneNumber={phoneNumber}
                                    onCountryChange={setPhoneCountry}
                                    onPhoneChange={setPhoneNumber}
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => { handleSavePhone(); MixpanelUtils.track("Admin Profile Updated", { field: "Phone Number" }); }}
                                        disabled={savingPhone || !phoneNumber || (user?.phoneNumber === `${phoneCountry} ${phoneNumber}`)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {savingPhone ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : "Save Phone"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Editable Wallet Address */}
                        <div>
                            <div className="flex flex-col gap-2">
                                <NexaAddressInput
                                    value={walletAddress}
                                    onChange={(val, valid) => {
                                        setWalletAddress(val);
                                        setIsWalletValid(valid);
                                    }}
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => { handleSaveWallet(); MixpanelUtils.track("Admin Profile Updated", { field: "Wallet Address" }); }}
                                        disabled={savingWallet || !walletAddress || !isWalletValid || (user?.nexaWalletAddress === walletAddress)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {savingWallet ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : "Save Wallet"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
