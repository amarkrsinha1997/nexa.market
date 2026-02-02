"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function LoginSkeleton() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0f1016] p-8">
            <div className="z-10 flex w-full max-w-[400px] flex-col items-center gap-4 text-center">
                <h1 className="flex justify-center w-full">
                    <Skeleton width="250px" height="40px" />
                </h1>
                <div className="flex w-full justify-center">
                    <Skeleton width="300px" height="20px" />
                </div>

                <div className="h-5" />

                {/* Google Button Skeleton */}
                <Skeleton width="320px" height="40px" borderRadius="4px" />
            </div>
        </div>
    );
}
