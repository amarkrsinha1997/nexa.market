"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import PhoneInput from "@/components/ui/PhoneInput";
import { ImageCacheUtils } from "@/lib/utils/image-cache";
import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";
import { Save, User as UserIcon, Calendar, Mail, Wallet, ChevronRight, LogOut } from "lucide-react";
import { format } from "date-fns";
import { MixpanelUtils } from "@/lib/utils/mixpanel";

export default function ProfilePage() {
    const { user, loading, refetch, logout } = useAuth();

    // Phone State
    const [countryCode, setCountryCode] = useState("+1");
    const [localPhoneNumber, setLocalPhoneNumber] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Initial Load
    useEffect(() => {
        if (!user) return;

        // Try to get cached image first
        const cached = ImageCacheUtils.getCachedImage(user.id);
        if (cached) {
            setProfileImage(cached);
        } else if (user.picture) {
            setProfileImage(user.picture);
        }

        if (user.phoneNumber) {
            // Simple split logic, ideally use a lib to parse strictly if needed
            // Assuming format "+Code Number" from Onboarding
            const parts = user.phoneNumber.split(" ");
            if (parts.length >= 2) {
                setCountryCode(parts[0]);
                setLocalPhoneNumber(parts.slice(1).join(""));
            } else {
                setLocalPhoneNumber(user.phoneNumber);
            }
        }
    }, [user]);

    const handleSave = async () => {
        if (localPhoneNumber.length < 5) return; // Basic check
        setIsSaving(true);
        setMessage(null);

        try {
            const fullPhoneNumber = `${countryCode} ${localPhoneNumber}`;
            const res = await apiClient.patch<{ user: any }>("/user/profile", {
                phoneNumber: fullPhoneNumber
            });

            if (res.success) {
                setMessage({ type: 'success', text: "Phone number updated successfully!" });
                await refetch();
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Failed to update profile" });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
    if (!user) return null;

    return (
        <div className="max-w-md mx-auto space-y-6 pt-8 pb-20"> {/* pb-20 for mobile footer clearance */}
            <header className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 mb-4 overflow-hidden border-2 border-gray-700">
                    {profileImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={profileImage} alt={user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="text-gray-400" size={40} />
                    )}
                </div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="inline-flex items-center gap-1 text-gray-400 text-sm bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Verified User
                </p>
            </header>

            <div className="bg-[#1a1b23] rounded-2xl p-6 shadow-xl border border-gray-800 space-y-6">
                <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Account Details</h2>

                {/* Read Only Fields */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Mail size={12} /> Email
                        </label>
                        <div className="bg-[#0f1016] p-3 rounded-lg text-gray-300 text-sm border border-gray-800 hover:border-gray-700 transition-colors">
                            {user.email}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={12} /> Member Since
                        </label>
                        <div className="bg-[#0f1016] p-3 rounded-lg text-gray-300 text-sm border border-gray-800 hover:border-gray-700 transition-colors">
                            {user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'N/A'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={12} /> Date of Birth
                        </label>
                        <div className="bg-[#0f1016] p-3 rounded-lg text-gray-300 text-sm border border-gray-800 hover:border-gray-700 transition-colors">
                            {user.dateOfBirth ? format(new Date(user.dateOfBirth), 'MMMM d, yyyy') : 'Not Set'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Wallet size={12} /> Wallet Address
                        </label>
                        <Link href="/users/wallet" className="block bg-[#0f1016] p-3 rounded-lg text-gray-300 text-sm border border-gray-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors cursor-pointer group relative pr-10">
                            <div className="flex items-center justify-between gap-2">
                                <span className="break-all font-mono">{user.nexaWalletAddress || 'Set your wallet address'}</span>
                                <ChevronRight size={16} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                            </div>
                            {user.nexaWalletAddress && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <CopyButton text={user.nexaWalletAddress} className="hover:bg-gray-700" />
                                </div>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-[#1a1b23] rounded-2xl p-6 shadow-xl border border-gray-800 space-y-6">
                <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Edit Information</h2>

                {/* Editable Phone */}
                <div className="space-y-4">
                    <PhoneInput
                        countryCode={countryCode}
                        phoneNumber={localPhoneNumber}
                        onCountryChange={setCountryCode}
                        onPhoneChange={setLocalPhoneNumber}
                    />

                    {message && (
                        <div className={`p-3 rounded text-sm text-center ${message.type === 'success' ? 'bg-green-900/20 text-green-300' : 'bg-red-900/20 text-red-300'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        onClick={() => { handleSave(); MixpanelUtils.track("User Phone Updated", { countryCode }); }}
                        disabled={isSaving || (user.phoneNumber === `${countryCode} ${localPhoneNumber}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isSaving ? "Saving..." : <><Save size={18} /> Update Phone Number</>}
                    </button>
                </div>
            </div>

            {/* Logout Button */}
            <div className="px-4">
                <button
                    onClick={() => {
                        if (confirm("Are you sure you want to log out? This will clear all session data.")) {
                            logout();
                            MixpanelUtils.track("Logout Clicked", { role: "User", source: "Profile Page" });
                        }
                    }}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold py-3 rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );
}
