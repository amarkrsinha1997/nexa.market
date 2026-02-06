"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { LocalStorageUtils } from "@/lib/utils/storage";
import { ROLES } from "@/lib/config/roles";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Shield, Zap, Lock, TrendingUp, ChevronRight } from "lucide-react";
import Image from "next/image";
import { MixpanelUtils } from "@/lib/utils/mixpanel";

export default function LandingPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [stats, setStats] = useState({
        volume24h: 0,
        circulatingSupply: 0,
        maxSupply: 21000000000000
    });

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isAuthenticated && user) {
            const preferredView = LocalStorageUtils.getPreferredView();
            if ((user.role === ROLES.ADMIN || user.role === ROLES.SUPERADMIN) && (preferredView === "admin" || preferredView === null)) {
                router.push("/admin/dashboard");
            } else {
                router.push("/users/home");
            }
        }
    }, [isAuthenticated, user, router]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setStats(data.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStats();
    }, []);

    // Helper to format numbers (e.g., 2.4B, 10.5T)
    const formatStat = (num: number | undefined, isCurrency = false) => {
        if (num === undefined || num === null || num === 0) return "Loading...";

        const suffix = isCurrency ? "₹" : "";

        if (num >= 1e12) return suffix + (num / 1e12).toFixed(2) + "T";
        if (num >= 1e9) return suffix + (num / 1e9).toFixed(2) + "B";
        if (num >= 1e6) return suffix + (num / 1e6).toFixed(2) + "M";
        return suffix + num.toLocaleString(undefined, { maximumFractionDigits: 0 });
    };

    const handleLogin = () => {
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-royal-blue selection:text-white">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-nexa-purple/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-nexa-yellow/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 relative transition-transform duration-500 group-hover:rotate-[360deg]">
                            <Image src="/nexa-logo.png" alt="Nexa" fill className="object-contain" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">
                            NEXA<span className="text-royal-blue">MARKET</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => { handleLogin(); MixpanelUtils.track("Landing Sign In Clicked"); }}
                        className="px-6 py-2.5 bg-royal-blue hover:bg-royal-blue-hover text-white rounded-full font-semibold transition-all shadow-lg shadow-royal-blue/20 flex items-center gap-2 group"
                    >
                        Sign In
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] animate-fade-in-up delay-100">
                            BUY <span className="nexa-gradient-text">NEXA</span><br />
                            WITH <span className="text-white italic">INSTANT</span> EASE
                        </h2>

                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up delay-200">
                            The most secure, lightning-fast platform to buy Nexa using Instant Payment.
                            Experience the future of digital assets with absolute precision.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up delay-300">
                            <button
                                onClick={() => { handleLogin(); MixpanelUtils.track("Landing Buy Now Clicked"); }}
                                className="group nexa-gradient-bg text-black font-bold px-10 py-4 rounded-full transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] flex items-center gap-2"
                            >
                                Buy Nexa Now
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </button>
                            <button
                                onClick={() => { window.open("https://www.coingecko.com/en/coins/nexa", "_blank"); MixpanelUtils.track("Landing View Markets Clicked"); }}
                                className="px-10 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all text-white font-semibold"
                            >
                                View Markets
                            </button>
                        </div>

                        {/* Visual Asset */}
                        <div className="relative w-full max-w-5xl mt-20 md:aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-fade-in-up delay-400 group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-40 group-hover:scale-105 transition-transform duration-1000" />

                            {/* Decorative Stats */}
                            <div className="relative md:absolute md:bottom-10 md:left-10 md:right-10 z-20 grid grid-cols-1 md:grid-cols-3 gap-8 items-end p-8 md:p-0">
                                <div className="text-left">
                                    <div className="text-3xl font-bold flex items-center gap-1">
                                        <TrendingUp className="text-emerald-400" size={24} />
                                        <span>{formatStat(stats.volume24h)} NEX</span>
                                    </div>
                                    <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">24H Trading Vol</div>
                                </div>
                                <div className="text-left md:text-center">
                                    <div className="text-3xl font-bold text-white">{formatStat(stats.circulatingSupply)}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Circulating Supply</div>
                                </div>
                                <div className="text-left md:text-right">
                                    <div className="text-3xl font-bold text-white">{formatStat(stats.maxSupply)}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Max Supply</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
                        <FeatureCard
                            icon={<Zap className="text-nexa-yellow" size={24} />}
                            title="Instant Payment"
                            description="One-click checkout with any UPI app. Funds reaching your wallet in record time."
                            delay="000"
                        />
                        <FeatureCard
                            icon={<Shield className="text-royal-blue" size={24} />}
                            title="L1 Blockchain Security"
                            description="Secured by Nexa's robust UTXO Layer-1 proof-of-work. Assets settle directly in your wallet, ensuring absolute self-custody."
                            delay="100"
                        />
                        <FeatureCard
                            icon={<Lock className="text-nexa-purple" size={24} />}
                            title="Non-Custodial"
                            description="Direct-to-Wallet delivery. Assets are transferred directly to your personal wallet immediately. We never hold your funds."
                            delay="200"
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-black/50 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                        <div className="w-8 h-8 relative">
                            <Image src="/nexa-logo.png" alt="Nexa" fill className="object-contain" />
                        </div>
                        <span className="font-bold tracking-tighter">NEXAMARKET</span>
                    </div>

                    <p className="text-sm text-gray-600 font-medium tracking-tight">
                        &copy; 2026 NEXA MARKET. MADE FOR THE NEXT GEN.
                    </p>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                    opacity: 0;
                }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
            `}</style>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: string }) {
    return (
        <div className={`glass-card rounded-3xl p-8 hover:border-white/20 hover:bg-white/[0.05] transition-all group animate-fade-in-up delay-${delay}`}>
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
                {description}
            </p>
        </div>
    );
}
