import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { authApi, User } from "../api/auth";
import { ROLES } from "@/lib/config/roles";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const checkAuth = async () => {
        try {
            // Check auth status (auto-refreshes if needed)
            let isAuth = await authApi.checkAuthStatus();

            if (!isAuth) {
                // Try explicit refresh if check failed
                isAuth = await authApi.refreshSession();
            }

            if (isAuth) {
                // Fetch fresh profile data to ensure we have latest onboarding status
                try {
                    const profileRes = await authApi.getProfile();
                    if (profileRes.success && profileRes.data) {
                        const freshUser = profileRes.data.user;
                        setUser(freshUser);
                        authApi.storeUser(freshUser); // Sync to storage

                        // Onboarding Check with FRESH data
                        if (pathname) {
                            const isOnboardingPage = pathname.includes("/users/onboarding");

                            if (!freshUser.isOnboardingCompleted && !isOnboardingPage) {
                                router.push("/users/onboarding");
                            } else if (freshUser.isOnboardingCompleted && isOnboardingPage) {
                                router.push("/users/home");
                            }
                        }
                    } else {
                        // Fallback to stored user if fetch fails (e.g. network error) but auth is valid
                        const storedUser = authApi.getStoredUser();
                        if (storedUser) setUser(storedUser);
                    }
                } catch (e) {
                    console.error("Failed to fetch fresh profile", e);
                    // Fallback to stored user
                    const storedUser = authApi.getStoredUser();
                    if (storedUser) setUser(storedUser);
                }
            } else {
                setUser(null);
                handleUnauthenticated();
            }
        } catch (error) {
            console.error("Auth check failed", error);
            setUser(null);
            handleUnauthenticated();
        } finally {
            setLoading(false);
        }
    };

    const handleUnauthenticated = () => {
        // Define public routes that don't satisfy auth requirement
        // For now, we don't hardblock everything, but if we need strict redirect:
        const publicRoutes = ["/login", "/", "/register", "/terms", "/privacy"];
        const isPublic = publicRoutes.some(route => pathname === route || pathname?.startsWith(route + "/"));

        // If not public and not authenticated, redirect
        if (!isPublic && pathname) {
            const returnUrl = encodeURIComponent(pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""));
            router.push(`/login?returnUrl=${returnUrl}`);
        }
    };

    const login = async (params: { googleToken?: string; code?: string; referralCode?: string }) => {
        try {
            const response = await authApi.googleLogin(params);
            if (response.success && response.data) {
                setUser(response.data.user);
                authApi.storeUser(response.data.user);
                return response.data;
            }
            throw new Error("Login failed");
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
        router.push("/login");
    };

    const refresh = async () => {
        return await authApi.refreshSession(true);
    };

    // Role Helpers
    const isAdmin = () => user?.role === ROLES.ADMIN;
    const isSuperAdmin = () => user?.role === ROLES.SUPERADMIN;
    const isSuperAdminOrAdmin = () => user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN;
    const isOnlyUser = () => user?.role === ROLES.USER;

    // User Detail Helper
    const getUserDetail = () => user;

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
        refresh,
        isAdmin,
        isSuperAdmin,
        isSuperAdminOrAdmin,
        isOnlyUser,
        getUserDetail
    };
}
