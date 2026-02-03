"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { LocalStorageUtils } from "@/lib/utils/storage";
import { ROLES } from "@/lib/config/roles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && user) {
            // Already logged in? Optional auto-redirect logic if desired, 
            // but landing page usually stays accessible.
            // If they click 'Login' or 'Get Started', they go to dashboard.
        }
    }, [isAuthenticated, user]);

    const handleGetStarted = () => {
        if (isAuthenticated && user) {
            const preferredView = LocalStorageUtils.getPreferredView();
            if ((user.role === ROLES.ADMIN || user.role === ROLES.SUPERADMIN) && (preferredView === "admin" || preferredView === null)) {
                router.push("/admin/dashboard");
            } else {
                router.push("/users/home");
            }
        } else {
            router.push("/login"); // Fixed: Go to login if not authenticated
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1016] text-white">
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
                    Nexa Market
                </h1>
                <div className="space-x-4">
                    <Link href="/login" className="hover:text-blue-400 transition" onClick={(e) => {
                        e.preventDefault();
                        handleGetStarted();
                    }}>
                        {isAuthenticated ? "Dashboard" : "Login"}
                    </Link>
                </div>
            </nav>

            <main className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
                <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                    The Future of <br />
                    <span className="text-blue-500">DeFi Trading</span>
                </h2>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10">
                    Experience lightning-fast swaps, deep liquidity, and secure asset management.
                    Join the revolution today.
                </p>
                <div className="flex gap-4">
                    <button onClick={handleGetStarted} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-emerald-500/20">
                        Get Started
                    </button>
                    <button className="border border-slate-700 hover:border-slate-500 px-8 py-3 rounded-xl transition">
                        Learn More
                    </button>
                </div>
            </main>

            <footer className="text-center py-10 text-slate-600 border-t border-slate-800">
                <p>&copy; 2026 Nexa Market. All rights reserved.</p>
            </footer>
        </div>
    );
}
