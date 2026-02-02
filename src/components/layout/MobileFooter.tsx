"use client";

import Link from "next/link";
import { Home, Wallet, User as UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export default function MobileFooter() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
            <div className="flex justify-around items-center h-16">
                <Link href="/users/home" className={clsx("flex flex-col items-center justify-center w-full h-full", isActive("/users/home") ? "text-blue-600" : "text-gray-500")}>
                    <Home size={24} />
                    <span className="text-xs mt-1">Home</span>
                </Link>
                <Link href="/users/wallet" className={clsx("flex flex-col items-center justify-center w-full h-full", isActive("/users/wallet") ? "text-blue-600" : "text-gray-500")}>
                    <Wallet size={24} />
                    <span className="text-xs mt-1">Wallet</span>
                </Link>
                <Link href="/users/profile" className={clsx("flex flex-col items-center justify-center w-full h-full", isActive("/users/profile") ? "text-blue-600" : "text-gray-500")}>
                    <UserIcon size={24} />
                    <span className="text-xs mt-1">Profile</span>
                </Link>
            </div>
        </div>
    );
}
