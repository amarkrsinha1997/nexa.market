"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { authApi } from "@/lib/api/auth";
import { useState, useEffect } from "react";
import { jwtVerify, decodeJwt } from "jose";

export default function UserHomePage() {
    const { user, loading, isAuthenticated, logout } = useAuth();
    const [tokenDetails, setTokenDetails] = useState<any>(null);
    const [refreshStatus, setRefreshStatus] = useState<string>("");
    const [rawToken, setRawToken] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("auth_token"); // Adjust key if needed from STORAGE_KEYS
        if (token) {
            setRawToken(token);
            try {
                // Simple decode for display
                const payload = decodeJwt(token);
                setTokenDetails(payload);
            } catch (e) {
                setTokenDetails({ error: "Failed to decode token" });
            }
        }
    }, [user]); // Re-run when user changes (e.g. after refresh)

    const handleManualRefresh = async () => {
        setRefreshStatus("Refreshing...");
        try {
            const result = await authApi.refreshSession(true); // Force refresh
            if (result) {
                setRefreshStatus("Success! Token refreshed.");
                // Update local state to show new token details
                const newToken = localStorage.getItem("auth_token");
                setRawToken(newToken || "");
                if (newToken) {
                    setTokenDetails(decodeJwt(newToken));
                }
            } else {
                setRefreshStatus("Failed. Check console.");
            }
        } catch (e) {
            setRefreshStatus("Error during refresh.");
            console.error(e);
        }
    };

    if (loading) return <div className="p-10">Loading...</div>;

    if (!isAuthenticated) return <div className="p-10">Not authenticated. <a href="/login" className="text-blue-500">Go to Login</a></div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">User Dashboard (Auth Test)</h1>

            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h2 className="text-xl font-semibold">User Profile (from localStorage)</h2>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto text-black">
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>

            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Current ID Token (JWT)</h2>
                <div className="flex gap-4">
                    <button
                        onClick={handleManualRefresh}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Test Refresh Token
                    </button>
                    <span className="self-center font-mono text-sm">{refreshStatus}</span>
                </div>

                <div>
                    <div>
                        <h3 className="font-medium mb-2 text-gray-800">Decoded Payload:</h3>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto text-black">
                            {JSON.stringify(tokenDetails, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <h3 className="font-medium mb-2 text-gray-800">Raw Token (Truncated):</h3>
                        <div className="bg-gray-100 p-4 rounded text-xs font-mono break-all text-black">
                            {rawToken.substring(0, 50)}...{rawToken.substring(rawToken.length - 20)}
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Logout
            </button>
        </div>
    );
}
