"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { LocalStorageUtils } from "@/lib/utils/storage";
import { ROLES } from "@/lib/config/roles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, Shield, Zap, Lock } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && user) {
            // Auto-redirect authenticated users
            const preferredView = LocalStorageUtils.getPreferredView();
            if ((user.role === ROLES.ADMIN || user.role === ROLES.SUPERADMIN) && (preferredView === "admin" || preferredView === null)) {
                router.push("/admin/dashboard");
            } else {
                router.push("/users/home");
            }
        }
    }, [isAuthenticated, user, router]);

    const handleLogin = () => {
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f1016] via-[#1a1b23] to-[#0f1016] text-white">
            {/* Navigation */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative">
                        <Image src="/nexa-logo.png" alt="Nexa" fill className="object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
                        Nexa Market
                    </h1>
                </div>
                <button
                    onClick={handleLogin}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all shadow-lg shadow-blue-900/20"
                >
                    Login
                </button>
            </nav>

            {/* Hero Section */}
            <main className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4">
                <div className="max-w-4xl space-y-8">
                    <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
                        Buy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">NEXA</span> with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">Indian Rupees</span>
                    </h2>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                        Fast, secure, and transparent NEXA trading platform.
                        Get started in minutes with UPI payments.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <button
                            onClick={handleLogin}
                            className="group bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-2xl shadow-blue-900/30 flex items-center gap-2"
                        >
                            Get Started
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
                        <div className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                <Zap className="text-blue-500" size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
                            <p className="text-sm text-gray-400">Instant UPI payments and quick NEXA transfers</p>
                        </div>

                        <div className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                <Shield className="text-emerald-500" size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Secure & Verified</h3>
                            <p className="text-sm text-gray-400">Bank-grade security for all transactions</p>
                        </div>

                        <div className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                <Lock className="text-purple-500" size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Your Keys, Your Crypto</h3>
                            <p className="text-sm text-gray-400">Non-custodial - you control your wallet</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-10 text-slate-600 border-t border-slate-800">
                <p>&copy; 2026 Nexa Market. All rights reserved.</p>
            </footer>
        </div>
    );
}
