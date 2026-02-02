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

// Icon for back button
function ArrowBackIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7 7-7-7 7-7" />
        </svg>
    );
}

// Icon for Google
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

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

            if (user.role === ROLES.ADMIN || user.role === ROLES.SUPERADMIN) {
                router.push("/portal");
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

                if (loggedInUser.role === ROLES.ADMIN || loggedInUser.role === ROLES.SUPERADMIN) {
                    router.push("/portal");
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
