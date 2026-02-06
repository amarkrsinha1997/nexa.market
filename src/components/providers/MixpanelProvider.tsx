"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { MixpanelUtils } from "@/lib/utils/mixpanel";
import { useAuthContext } from "@/lib/contexts/AuthContext";

import { LocalStorageUtils } from "@/lib/utils/storage";

export default function MixpanelProvider() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuthContext();

    // Initialize Mixpanel & Hydrate User from Storage (Fast Path)
    useEffect(() => {
        MixpanelUtils.init();

        // Immediately check local storage to set Super Properties before first page view
        const storedUser = LocalStorageUtils.getUser();
        if (storedUser) {
            MixpanelUtils.identify(storedUser.id);
            MixpanelUtils.setUserProfile(storedUser);
        }
    }, []);

    // Generate Page Name
    const getPageName = (path: string): string => {
        if (path === "/") return "Landing Page";
        if (path === "/login") return "Login Page";

        // Users
        if (path === "/users/home") return "User Dashboard";
        if (path === "/users/profile") return "User Profile";
        if (path === "/users/ledger") return "User Ledger";
        if (path === "/users/wallet") return "User Wallet";
        if (path === "/users/onboarding") return "User Onboarding";
        if (path.startsWith("/users/payment/")) return "User Payment Page";
        if (path.startsWith("/users/orders/")) return "User Order Details";

        // Admin
        if (path === "/admin/dashboard" || path === "/admin") return "Admin Dashboard"; // Handle both if needed
        if (path === "/admin/ledger") return "Admin Ledger";
        if (path === "/admin/upi") return "Admin UPI Management";
        if (path === "/admin/profile") return "Admin Profile";
        if (path === "/admin/settings") return "Admin Settings";
        if (path.startsWith("/admin/orders/")) return "Admin Order Details";

        return "Unknown Page";
    };

    // Track Page Views
    useEffect(() => {
        if (pathname) {
            const url = `${pathname}${searchParams && searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
            const pageName = getPageName(pathname);

            MixpanelUtils.track("Page View", {
                "Page Name": pageName,
                path: pathname,
                url: url
            });
        }
    }, [pathname, searchParams]);

    // Track User Identity
    useEffect(() => {
        if (user) {
            MixpanelUtils.identify(user.id);
            MixpanelUtils.setUserProfile(user);
        }
    }, [user]);

    return null;
}
