"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRole } from "@/lib/hooks/useRole";
import ExchangeForm from "@/components/features/exchange/ExchangeForm";
import { Shield } from "lucide-react";
import Link from "next/link";
import { LocalStorageUtils } from "@/lib/utils/storage";
import { MixpanelUtils } from "@/lib/utils/mixpanel";

export default function UserHomePage() {
    const { user, loading } = useAuth();
    const { isAdmin } = useRole();

    const handleAdminSwitch = () => {
        LocalStorageUtils.setPreferredView("admin");
        MixpanelUtils.track("Switch to Admin Portal Clicked", { source: "User Home" });
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

    return (
        <div className="max-w-md mx-auto space-y-6 pt-8 px-4">
            <header className="space-y-1">
                <h1 className="text-2xl font-bold text-white">Exchange</h1>
                <p className="text-gray-400 text-sm">Buy Nexa instantly</p>
            </header>

            <ExchangeForm />

            {isAdmin && (
                <div className="pt-4 border-t border-gray-800">
                    <Link
                        href="/admin/dashboard"
                        onClick={handleAdminSwitch}
                        className="w-full bg-[#1a1b23] border border-gray-700 hover:border-blue-500 hover:bg-gray-900 text-left p-4 rounded-xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Admin Portal</h3>
                                <p className="text-gray-400 text-xs">Manage system and verifications</p>
                            </div>
                        </div>
                        <Shield className="rotate-0 text-gray-500 group-hover:text-white transition-all h-5 w-5" />
                    </Link>
                </div>
            )}
        </div>
    );
}
