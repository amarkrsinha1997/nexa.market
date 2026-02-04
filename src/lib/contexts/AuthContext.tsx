"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AuthApi } from "@/lib/api/auth";
import { UserApi } from "@/lib/api/user";
import { LocalStorageUtils } from "@/lib/utils/storage";
import { User } from "@prisma/client";
import { ROLES } from "@/lib/config/roles";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (params: { googleToken?: string; code?: string; referralCode?: string }) => Promise<any>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    refresh: () => Promise<boolean>;
    refetch: () => Promise<void>; // Added for manual profile refresh
    isAdmin: () => boolean;
    isSuperAdmin: () => boolean;
    isSuperAdminOrAdmin: () => boolean;
    isOnlyUser: () => boolean;
    getUserDetail: () => User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // -- Auth Logic moved from useAuth --

    const checkAuth = async () => {
        try {
            let isAuth = await AuthApi.checkAuthStatus();
            if (!isAuth) {
                isAuth = await AuthApi.refreshSession();
            }

            if (isAuth) {
                try {
                    // This is the key change: We only fetch if we don't have user, OR if we explicitly want to (but here we are in checkAuth).
                    // Actually, checkAuth is called on mount. We should fetch profile here.
                    // But if we already have user in state, maybe skip?
                    // For safety on mount/reload, we must fetch at least once.
                    // But `checkAuth` is called by `useAuth` effect on every pathname change. THAT IS THE BUG.

                    // We will NOT call checkAuth on every pathname change in the Context version.
                    // We will only do it on mount.

                    const freshUser = await UserApi.getProfile();
                    if (freshUser) {
                        setUser(freshUser);
                        LocalStorageUtils.setUser(freshUser);
                        handleOnboardingRedirect(freshUser);
                    } else {
                        fallbackToStored();
                    }
                } catch (e) {
                    console.error("Failed to fetch fresh profile", e);
                    fallbackToStored();
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

    const handleOnboardingRedirect = (u: User) => {
        if (!pathname) return;

        const publicRoutes = ["/login", "/", "/register", "/terms", "/privacy"];
        const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
        if (isPublic) return;

        const isOnboardingPage = pathname.includes("/users/onboarding");

        if (!u.isOnboardingCompleted && !isOnboardingPage) {
            // Save the intended destination if it's not onboarding or home
            if (pathname !== "/users/home") {
                localStorage.setItem("post_onboarding_redirect", pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""));
            }
            router.push("/users/onboarding");
        } else if (u.isOnboardingCompleted && isOnboardingPage) {
            const redirectPath = localStorage.getItem("post_onboarding_redirect") || "/users/home";
            localStorage.removeItem("post_onboarding_redirect");
            router.push(redirectPath);
        }
    };

    const fallbackToStored = () => {
        const storedUser = LocalStorageUtils.getUser();
        if (storedUser) setUser(storedUser);
    };

    const handleUnauthenticated = () => {
        const publicRoutes = ["/login", "/", "/register", "/terms", "/privacy"];
        const isPublic = publicRoutes.some(route => pathname === route || pathname?.startsWith(route + "/"));
        if (!isPublic && pathname) {
            // const returnUrl = encodeURIComponent(pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""));
            // router.push(`/login?returnUrl=${returnUrl}`);
            // Let middleware handle redirects or keep simple push
            router.push("/login");
        }
    };

    const login = async (params: { googleToken?: string; code?: string; referralCode?: string }) => {
        const response = await AuthApi.loginWithGoogle(params.googleToken, params.code, params.referralCode);
        if (response.success && response.data) {
            setUser(response.data.user);
            LocalStorageUtils.setUser(response.data.user);
            return response.data;
        }
        throw new Error("Login failed");
    };

    const logout = () => {
        AuthApi.logout();
        setUser(null);
        router.push("/login");
    };

    const refresh = async () => {
        return await AuthApi.refreshSession(true);
    };

    const refetch = async () => {
        try {
            const updatedUser = await UserApi.getProfile();
            if (updatedUser) {
                setUser(updatedUser);
                LocalStorageUtils.setUser(updatedUser);
            }
        } catch (e) {
            console.error("Failed to refetch profile", e);
        }
    };

    // Role Helpers
    const isAdmin = () => user?.role === ROLES.ADMIN;
    const isSuperAdmin = () => user?.role === ROLES.SUPERADMIN;
    const isSuperAdminOrAdmin = () => user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN;
    const isOnlyUser = () => user?.role === ROLES.USER;
    const getUserDetail = () => user;

    useEffect(() => {
        // Fetch on mount only
        checkAuth();
    }, []);

    // Enforce onboarding redirect on every route change
    useEffect(() => {
        if (!loading && user) {
            handleOnboardingRedirect(user);
        }
    }, [pathname, user, loading]);

    return (
        <AuthContext.Provider value={{
            user, loading, isAuthenticated: !!user, login, logout, checkAuth, refresh, refetch,
            isAdmin, isSuperAdmin, isSuperAdminOrAdmin, isOnlyUser, getUserDetail
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}
