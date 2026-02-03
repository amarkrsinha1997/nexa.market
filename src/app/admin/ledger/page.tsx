"use client";

import ArrowBackIcon from "@/components/icons/ArrowBackIcon";
import Link from "next/link";
import LedgerPage from "@/app/users/ledger/page"; // Reuse existing ledger for now, can be specialized later

// In a real app, you might want to wrap this to inject extra admin capabilities
// or different filters. For now, we reuse the existing robust LedgerPage.

export default function AdminLedgerPage() {
    return (
        <div className="bg-[#0f1016] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 pt-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin/dashboard" className="p-2 bg-[#1a1b23] rounded-full text-gray-400 hover:text-white transition-colors">
                        <ArrowBackIcon className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Transaction Ledger</h1>
                </div>
                {/* Reusing existing Ledger Page Logic with admin view */}
                <LedgerPage adminView={true} />
            </div>
        </div>
    );
}
