"use client";

import Link from "next/link";
import { Home, User as UserIcon, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export default function MobileFooter() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1b23] border-t border-gray-800 z-40 pb-safe">
            <div className="flex justify-around items-center h-16">
                <Link href="/users/home" className={clsx("flex flex-col items-center justify-center w-full h-full", isActive("/users/home") ? "text-blue-500" : "text-gray-400")}>
                    <Home size={24} />
                    <span className="text-xs mt-1">Home</span>
                </Link>
                <Link href="/users/ledger" className={clsx("flex flex-col items-center justify-center w-full h-full", isActive("/users/ledger") ? "text-blue-500" : "text-gray-400")}>
                    <FileText size={24} />
                    <span className="text-xs mt-1">Ledger</span>
                </Link>
                <Link href="/users/profile" className={clsx("flex flex-col items-center justify-center w-full h-full", isActive("/users/profile") ? "text-blue-500" : "text-gray-400")}>
                    <UserIcon size={24} />
                    <span className="text-xs mt-1">Profile</span>
                </Link>
            </div>
        </div>
    );
}
