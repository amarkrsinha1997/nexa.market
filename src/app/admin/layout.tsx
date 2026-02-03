"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRole } from "@/lib/hooks/useRole";
import { Loader2, FileText, Settings, User, Wallet } from "lucide-react";
import Link from "next/link";
import { LocalStorageUtils } from "@/lib/utils/storage";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAdmin, loading } = useRole();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!isAdmin) {
                router.push("/users/home");
                return;
            }

            // Ensure preference is set to admin when accessing admin routes
            const currentPref = LocalStorageUtils.getPreferredView();
            if (currentPref !== "admin") {
                LocalStorageUtils.setPreferredView("admin");
            }
        }
    }, [isAdmin, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#0f1016]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!isAdmin) return null;

    const navItems = [
        { name: "Ledger", href: "/admin/ledger", icon: FileText },
        { name: "UPI", href: "/admin/upi", icon: Wallet },
        { name: "Profile", href: "/admin/profile", icon: User },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#0f1016] flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-gray-800 bg-[#1a1b23] p-6 space-y-8 fixed h-full z-10">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Admin Portal</h1>
                        <p className="text-xs text-gray-500">Nexa Market</p>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Content Area */}
            <main className="flex-1 md:ml-64 pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1b23] border-t border-gray-800 pb-safe z-50">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-blue-500" : "text-gray-500"
                                    }`}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
