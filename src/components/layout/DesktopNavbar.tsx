"use client";

import { useState } from "react";
import { Menu, X, Home, Wallet, User as UserIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth"; // for logout

export default function DesktopNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { logout } = useAuth();

    return (
        <>
            {/* Top Bar for Desktop */}
            <div className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 items-center px-6 z-40 justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-100 rounded">
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
            <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 md:block hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-4 border-b flex justify-between items-center">
                    <span className="font-bold text-lg">Menu</span>
                    <button onClick={() => setIsOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4 flex flex-col gap-4">
                    <Link href="/users/home" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded" onClick={() => setIsOpen(false)}>
                        <Home size={20} />
                        Home
                    </Link>
                    <Link href="/users/wallet" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded" onClick={() => setIsOpen(false)}>
                        <Wallet size={20} />
                        Wallet
                    </Link>
                    <Link href="/users/profile" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded" onClick={() => setIsOpen(false)}>
                        <UserIcon size={20} />
                        Profile
                    </Link>

                    <button onClick={logout} className="flex items-center gap-3 p-2 hover:bg-red-50 text-red-600 rounded mt-auto">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}
