"use client";

import { useState } from "react";
import { Menu, X, Home, User as UserIcon, LogOut, FileText } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth"; // for logout
import { MixpanelUtils } from "@/lib/utils/mixpanel";
import { MixpanelEvents } from "@/lib/config/mixpanel-events";

export default function DesktopNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { logout } = useAuth();

    return (
        <>
            {/* Top Bar for Desktop */}
            <div className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-[#1a1b23] border-b border-gray-800 items-center px-6 z-40 justify-between text-white">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-800 rounded">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-xl">Nexa Market</span>
                </div>
                <div>
                    {/* Right side items if needed */}
                </div>
            </div>

            {/* Sidebar Drawer */}
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:block hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Side Menu */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-[#1a1b23] text-white shadow-lg z-50 transform transition-transform duration-300 md:block hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <span className="font-bold text-lg">Menu</span>
                    <button onClick={() => setIsOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4 flex flex-col gap-4">
                    <Link href="/users/home" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded" onClick={() => { setIsOpen(false); MixpanelUtils.track(MixpanelEvents.USER_HOME_MENU_CLICKED, { item: "Home", role: "User", device: "Desktop" }); }}>
                        <Home size={20} />
                        Home
                    </Link>
                    <Link href="/users/profile" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded" onClick={() => { setIsOpen(false); MixpanelUtils.track(MixpanelEvents.USER_PROFILE_MENU_CLICKED, { item: "Profile", role: "User", device: "Desktop" }); }}>
                        <UserIcon size={20} />
                        Profile
                    </Link>
                    <Link href="/users/ledger" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded" onClick={() => { setIsOpen(false); MixpanelUtils.track(MixpanelEvents.USER_LEDGER_MENU_CLICKED, { item: "Ledger", role: "User", device: "Desktop" }); }}>
                        <FileText size={20} />
                        Ledger
                    </Link>

                    <button onClick={() => { logout(); MixpanelUtils.track(MixpanelEvents.USER_LOGOUT_CLICKED, { role: "User" }); }} className="flex items-center gap-3 p-2 hover:bg-red-900/20 text-red-500 rounded mt-auto">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}
