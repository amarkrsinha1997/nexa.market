"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function OnboardingSkeleton() {
    return (
        <div className="min-h-screen bg-[#0f1016] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#1a1b23] p-8 rounded-lg shadow-xl space-y-6 border border-gray-800">
                <div className="flex flex-col items-center gap-2">
                    <Skeleton width="200px" height="32px" />
                    <Skeleton width="300px" height="16px" />
                </div>

                <div className="space-y-6 mt-8">
                    {/* Date of Birth */}
                    <div className="space-y-2">
                        <Skeleton width="100px" height="16px" />
                        <Skeleton width="100%" height="48px" borderRadius="0.5rem" />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Skeleton width="120px" height="16px" />
                        <Skeleton width="100%" height="42px" borderRadius="0.25rem" />
                    </div>

                    {/* Nexa Address */}
                    <div className="space-y-2">
                        <Skeleton width="150px" height="16px" />
                        <Skeleton width="100%" height="42px" borderRadius="0.25rem" />
                    </div>

                    <Skeleton width="100%" height="44px" borderRadius="0.25rem" className="mt-4" />
                </div>
            </div>
        </div>
    );
}
