"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { CheckCircle2, AlertCircle } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import PhoneInput from "@/components/ui/PhoneInput";
import NexaAddressInput from "@/components/ui/NexaAddressInput";

export default function OnboardingForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fields
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
    const [countryCode, setCountryCode] = useState("+1");
    const [localPhoneNumber, setLocalPhoneNumber] = useState("");
    const [nexaAddress, setNexaAddress] = useState("");
    const [isAddressValid, setIsAddressValid] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!dateOfBirth) {
            setError("Date of Birth is required");
            return;
        }
        if (!localPhoneNumber || localPhoneNumber.length !== 10) {
            setError("Please enter a valid 10-digit Phone Number");
            return;
        }
        if (!nexaAddress || !isAddressValid) {
            setError("Valid Nexa Wallet Address is required");
            return;
        }

        setIsLoading(true);

        const fullPhoneNumber = `${countryCode} ${localPhoneNumber}`;

        try {
            await apiClient.patch("/user/profile", {
                dateOfBirth,
                phoneNumber: fullPhoneNumber,
                nexaWalletAddress: nexaAddress
            });

            router.push("/users/home");
        } catch (e: any) {
            setError(e.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-[#1a1b23] p-8 rounded-lg shadow-2xl space-y-6 border border-gray-800">
            <h1 className="text-2xl font-bold text-center text-white">Complete Your Profile</h1>
            <p className="text-center text-gray-400 text-sm">We just need a few more details to get you setup.</p>

            {error && (
                <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-3 rounded text-sm text-center flex items-center justify-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                <DatePicker
                    label="Date of Birth"
                    selected={dateOfBirth}
                    onSelect={setDateOfBirth}
                />

                <PhoneInput
                    countryCode={countryCode}
                    phoneNumber={localPhoneNumber}
                    onCountryChange={setCountryCode}
                    onPhoneChange={setLocalPhoneNumber}
                />

                <NexaAddressInput
                    value={nexaAddress}
                    onChange={(val, valid) => {
                        setNexaAddress(val);
                        setIsAddressValid(valid);
                    }}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                    {isLoading ? "Saving..." : <><CheckCircle2 size={18} /> Continue</>}
                </button>
            </form>
        </div>
    );
}
