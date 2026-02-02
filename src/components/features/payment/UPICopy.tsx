"use client";

import CopyButton from "@/components/ui/CopyButton";

interface UPICopyProps {
    upiId: string;
}

export default function UPICopy({ upiId }: UPICopyProps) {
    return (
        <div className="bg-[#0f1016] p-3 rounded-lg border border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">UPI ID</span>
            <div className="flex items-center gap-2">
                <span className="text-sm text-white font-mono">{upiId}</span>
                <CopyButton text={upiId} className="hover:bg-gray-700" />
            </div>
        </div>
    );
}
