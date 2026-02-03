"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { ROLES } from "@/lib/config/roles";

export function useRole() {
    const { user, loading } = useAuth();

    const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN;
    const isSuperAdmin = user?.role === ROLES.SUPERADMIN;
    const isUser = user?.role === ROLES.USER;

    return {
        user,
        loading,
        isAdmin,
        isSuperAdmin,
        isUser,
        role: user?.role
    };
}
