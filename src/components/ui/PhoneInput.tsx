"use client";

import { Phone } from "lucide-react";
import CountrySelect from "./CountrySelect";

interface PhoneInputProps {
    countryCode: string;
    phoneNumber: string;
    onCountryChange: (code: string) => void;
    onPhoneChange: (number: string) => void;
    className?: string;
}

export default function PhoneInput({
    countryCode,
    phoneNumber,
    onCountryChange,
    onPhoneChange,
    className
}: PhoneInputProps) {

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (val.length <= 10) {
            onPhoneChange(val);
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                <Phone size={16} className="text-blue-500" />
                Phone Number
            </label>
            <div className="flex">
                <CountrySelect
                    value={countryCode}
                    onChange={onCountryChange}
                />
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phoneNumber}
                    onChange={handleNumberChange}
                    placeholder="1234567890"
                    maxLength={10}
                    autoComplete="tel"
                    inputMode="tel"
                    className="flex-1 w-full p-3 border border-l-0 border-gray-700 rounded-r-md bg-[#2a2b36] text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-colors"
                />
            </div>
        </div>
    );
}
