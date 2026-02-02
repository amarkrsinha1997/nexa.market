"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import ExchangeForm from "@/components/features/exchange/ExchangeForm";

export default function UserHomePage() {
    const { user, loading } = useAuth();


    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

    return (
        <div className="max-w-md mx-auto space-y-6 pt-8">
            <header className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-white">Exchange</h1>
                <p className="text-gray-400 text-sm">Buy Nexa instantly</p>
            </header>

            <ExchangeForm rate={1.25} />
        </div>
    );
}
