"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import RoleSelectionModal from "@/components/auth/RoleSelectionModal";
import LoginSkeleton from "@/components/skeletons/LoginSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGoogleLogin } from "@react-oauth/google";
import { ROLES } from "@/lib/config/roles";
import GoogleIcon from "@/components/icons/GoogleIcon";
import ArrowBackIcon from "@/components/icons/ArrowBackIcon";
import { LocalStorageUtils } from "@/lib/utils/storage";

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated, user, loading: authLoading } = useAuth();

    const [showRoleModal, setShowRoleModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get referral code from URL if present
    const referralCode = searchParams.get("ref");

    // Redirect if already authenticated
    useEffect(() => {
        // Early escape if we know for sure they are NOT authenticated
        if (!authLoading && !isAuthenticated) return;

        // If authenticated, wait for user data to be loaded (either from storage or recovery fetch)
        if (isAuthenticated && user) {
            const returnUrl = searchParams.get("returnUrl");
            if (returnUrl) {
                router.push(returnUrl);
                return;
            }

            // Check preferred view from LocalStorage
            const preferredView = LocalStorageUtils.getPreferredView();

            if ((user.role === ROLES.ADMIN || user.role === ROLES.SUPERADMIN) && preferredView === "admin") {
                router.push("/admin/dashboard");
            } else if (user.role === ROLES.ADMIN || user.role === ROLES.SUPERADMIN) {
                // Admin user but no preference or user preference -> verify if they have preference set, if not default to admin dashboard for first time?
                // Actually user request says "keep the preference set... that what needs to be opened"
                // If no preference, maybe default based on role usually, but let's stick to simple logic:
                // If explicitly admin pref -> admin dash. Else -> user home (which has the switch button)

                // Correction: The requirement is "keep the preference set... use that only for Admin".
                // If I am admin and I last used admin portal, go there.
                // If I am admin and I last used user portal, go there.
                // If new admin login (no pref), maybe default to Admin Portal?
                // Let's check if preferredView is null.
                if (preferredView === null) {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/users/home");
                }
            } else {
                router.push("/users/home");
            }
        }
    }, [isAuthenticated, user, authLoading, router, searchParams]);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            console.log("GOOGLE OAUTH RESPONSE:", codeResponse);
            setLoading(true);
            setError(null);

            try {
                const code = codeResponse.code;
                if (!code) throw new Error("No authorization code received");

                // Call backend API with code
                const result = await login({ code, referralCode: referralCode || undefined });
                console.log("LOGIN RESULT:", result);

                const loggedInUser = result.user;
                const returnUrl = searchParams.get("returnUrl");

                console.log("Redirect logic:", { role: loggedInUser.role, returnUrl });

                if (returnUrl) {
                    router.push(returnUrl);
                    return;
                }

                const preferredView = LocalStorageUtils.getPreferredView();

                if (loggedInUser.role === ROLES.ADMIN || loggedInUser.role === ROLES.SUPERADMIN) {
                    if (preferredView === "admin" || preferredView === null) {
                        router.push("/admin/dashboard");
                    } else {
                        router.push("/users/home");
                    }
                } else if (result.isNewUser) {
                    router.push("/users/home?welcome=true");
                } else {
                    router.push("/users/home");
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : "Failed to sign in. Please try again.";
                console.error("Login failed:", err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        onError: (errorResponse) => {
            console.error("Google Login Error:", errorResponse);
            setError("Google sign in failed. Please try again.");
        },
        flow: 'auth-code',
    });

    if (authLoading) {
        return <LoginSkeleton />;
    }

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0f1016] p-8">
            <Link href="/" className="absolute left-8 top-8 z-10 flex items-center gap-2 text-sm text-[#a0a0a0] no-underline transition-colors hover:text-[#5b4bff]">
                <ArrowBackIcon className="h-5 w-5" />
                Back to Home
            </Link>

            <div className="relative z-[1] flex w-full max-w-[400px] flex-col items-center text-center">
                <h1 className="mb-2 text-4xl font-bold text-white">Welcome</h1>
                <p className="mb-8 text-[#a0a0a0]">
                    Securely manage your fixed deposits with Nexa Market.
                </p>

                {error && <div className="mb-4 text-center text-sm font-medium text-red-500">{error}</div>}

                <button
                    onClick={() => handleGoogleLogin()}
                    disabled={loading}
                    className="mb-4 flex cursor-pointer items-center justify-center gap-2.5 rounded bg-white px-4 py-2.5 text-[#3c4043] shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                    style={{ width: '320px', border: '1px solid #dadce0' }}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Skeleton width="18px" height="18px" borderRadius="50%" className="!bg-gray-300" />
                            Signing in...
                        </span>
                    ) : (
                        <>
                            <GoogleIcon className="h-[18px] w-[18px]" />
                            <span className="font-medium">Sign in with Google</span>
                        </>
                    )}
                </button>

                {referralCode && (
                    <p className="mt-2 text-sm text-[#a0a0a0]">
                        Using referral code: {referralCode}
                    </p>
                )}
            </div>

            <div className="absolute bottom-8 left-0 right-0 z-[1] px-8 text-center">
                <p className="text-xs leading-relaxed text-[#a0a0a0]">
                    By continuing, you agree to our <Link href="/terms" className="text-[#5b4bff] hover:underline">Terms of Service</Link>{" "}
                    and <Link href="/privacy" className="text-[#5b4bff] hover:underline">Privacy Policy</Link>.
                </p>
            </div>

            <RoleSelectionModal
                isOpen={showRoleModal}
                onClose={() => setShowRoleModal(false)}
            />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <LoginSkeleton />
            }
        >
            <LoginPageContent />
        </Suspense>
    );
}
