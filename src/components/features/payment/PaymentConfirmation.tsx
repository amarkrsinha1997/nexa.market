"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface PaymentConfirmationProps {
    onConfirm: () => Promise<void>;
    confirming: boolean;
}

export default function PaymentConfirmation({ onConfirm, confirming }: PaymentConfirmationProps) {
    return (
        <button
            onClick={onConfirm}
            disabled={confirming}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-[0.98]"
        >
            {confirming ? <Loader2 className="animate-spin mx-auto" /> : "I have made the payment"}
        </button>
    );
}
