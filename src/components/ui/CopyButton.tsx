"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
    text: string;
    className?: string;
}

export default function CopyButton({ text, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation(); // Stop event bubbling

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={cn(
                "p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors",
                className
            )}
            title="Copy to clipboard"
        >
            {copied ? (
                <Check size={16} className="text-green-500" />
            ) : (
                <Copy size={16} />
            )}
        </button>
    );
}
