export const ROLES = {
    USER: "USER",
    ADMIN: "ADMIN",
    SUPERADMIN: "SUPERADMIN",
} as const;

export type Role = keyof typeof ROLES;
