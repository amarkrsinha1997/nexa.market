"use client";

import { useState, useEffect } from "react";
import { Loader2, Timer } from "lucide-react";

interface PaymentConfirmationProps {
    onConfirm: () => Promise<void>;
    confirming: boolean;
}

export default function PaymentConfirmation({ onConfirm, confirming }: PaymentConfirmationProps) {
    const [timeRemaining, setTimeRemaining] = useState(30);
    const [isTimerComplete, setIsTimerComplete] = useState(false);

    useEffect(() => {
        if (timeRemaining > 0) {
            const timer = setTimeout(() => {
                setTimeRemaining(timeRemaining - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setIsTimerComplete(true);
        }
    }, [timeRemaining]);

    const isDisabled = confirming || !isTimerComplete;

    return (
        <button
            onClick={onConfirm}
            disabled={isDisabled}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
        >
            {confirming ? (
                <Loader2 className="animate-spin mx-auto" />
            ) : !isTimerComplete ? (
                <div className="flex items-center justify-center gap-2">
                    <Timer size={18} />
                    <span>Wait {timeRemaining}s to confirm</span>
                </div>
            ) : (
                <span>Confirm Payment <span className="text-sm">(भुगतान पूर्ण करें)</span></span>
            )}
        </button>
    );
}
