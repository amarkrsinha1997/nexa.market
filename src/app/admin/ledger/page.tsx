"use client";

import LedgerPage from "@/app/users/ledger/page"; // Reuse existing ledger for now, can be specialized later

// In a real app, you might want to wrap this to inject extra admin capabilities
// or different filters. For now, we reuse the existing robust LedgerPage.

export default function AdminLedgerPage() {
    return (
        <div className="bg-[#0f1016] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 md:pt-4">
                {/* Reusing existing Ledger Page Logic with admin view */}
                <LedgerPage adminView={true} />
            </div>
        </div>
    );
}
