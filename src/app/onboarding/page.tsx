"use client";

import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import OnboardingSkeleton from "@/components/skeletons/OnboardingSkeleton";

export default function OnboardingPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login?returnUrl=/onboarding");
        }
        // If user already has details, maybe redirect?
        if (user && user.nexaWalletAddress && user.dateOfBirth && user.phoneNumber) {
            router.push("/users/home");
        }
    }, [user, loading, isAuthenticated, router]);

    if (loading) return <OnboardingSkeleton />;

    return (
        <div className="min-h-screen bg-[#0f1016] flex flex-col items-center justify-center p-4">
            <OnboardingForm />
        </div>
    );
}
