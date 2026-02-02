"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
    className?: string;
    label?: string;
}

export default function BackButton({ className, label = "Back" }: BackButtonProps) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className={`group flex items-center gap-1 text-gray-400 hover:text-white transition-colors ${className || ""}`}
        >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}
