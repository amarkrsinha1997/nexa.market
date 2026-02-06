import { useState, useEffect } from "react";
import { Wallet, Clipboard, Copy, AlertCircle, Check } from "lucide-react";
import { Address } from "libnexa-ts";
import { useToast } from "@/lib/hooks/useToast";

interface NexaAddressInputProps {
    value: string;
    onChange?: (value: string, isValid: boolean) => void;
    className?: string;
    readOnly?: boolean;
    showCopy?: boolean;
    label?: string;
}

export default function NexaAddressInput({
    value,
    onChange,
    className,
    readOnly = false,
    showCopy = false,
    label = "Nexa Wallet Address"
}: NexaAddressInputProps) {
    const [isValid, setIsValid] = useState(true);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    // Validate on load if value exists
    useEffect(() => {
        if (value) {
            validate(value);
        }
    }, [value]);

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
        onChange?.(val, valid);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            handleChange(text);
            toast.success("Address pasted from clipboard");
        } catch (err) {
            console.error('Failed to read clipboard', err);
            toast.error("Failed to paste from clipboard");
        }
    };

    const handleCopy = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success("Address copied");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
            toast.error("Failed to copy address");
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                <Wallet size={16} className="text-blue-500" />
                {label}
            </label>
            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => !readOnly && handleChange(e.target.value)}
                    readOnly={readOnly}
                    placeholder="nexa:..."
                    rows={3}
                    className={`w-full p-3 pr-24 border rounded-xl bg-[#2a2b36] text-white placeholder-gray-600 focus:ring-2 outline-none transition-colors resize-none font-mono text-sm leading-relaxed ${!isValid
                        ? "border-red-500 focus:ring-red-500/50"
                        : "border-gray-700 focus:ring-blue-500/50"
                        } ${readOnly ? "cursor-default text-gray-300 bg-[#2a2b36]/50" : ""}`}
                />

                <div className="absolute right-2 top-2 flex flex-col gap-2">
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handlePaste}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-xs rounded-lg text-white transition-colors flex items-center gap-1 shadow-sm"
                        >
                            <Clipboard size={12} />
                            Paste
                        </button>
                    )}

                    {(showCopy || readOnly) && value && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? "Copied" : "Copy"}
                        </button>
                    )}
                </div>
            </div>
            {!isValid && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> Invalid Nexa Address</p>}
        </div>
    );
}
