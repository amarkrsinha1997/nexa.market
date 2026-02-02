"use client";

import { useState, useEffect } from "react";
import { Wallet, Clipboard, AlertCircle } from "lucide-react";
import { Address } from "libnexa-ts";

interface NexaAddressInputProps {
    value: string;
    onChange: (value: string, isValid: boolean) => void;
    className?: string;
}

export default function NexaAddressInput({ value, onChange, className }: NexaAddressInputProps) {
    const [isValid, setIsValid] = useState(true);

    // Validate on load if value exists
    useEffect(() => {
        if (value) {
            validate(value);
        }
    }, []);

    const validate = (val: string) => {
        if (!val) {
            setIsValid(true);
            return true;
        }
        try {
            const valid = Address.isValid(val);
            setIsValid(valid);
            return valid;
        } catch (e) {
            setIsValid(false);
            return false;
        }
    };

    const handleChange = (val: string) => {
        const valid = validate(val);
        onChange(val, valid);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            handleChange(text);
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                <Wallet size={16} className="text-blue-500" />
                Nexa Wallet Address
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="nexa:..."
                    className={`w-full p-3 pr-24 border rounded bg-[#2a2b36] text-white placeholder-gray-600 focus:ring-2 outline-none transition-colors ${!isValid
                            ? "border-red-500 focus:ring-red-500/50"
                            : "border-gray-700 focus:ring-blue-500/50"
                        }`}
                />
                <button
                    type="button"
                    onClick={handlePaste}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-xs rounded text-white transition-colors flex items-center gap-1"
                >
                    <Clipboard size={12} />
                    Paste
                </button>
            </div>
            {!isValid && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> Invalid Nexa Address</p>}
        </div>
    );
}
