/**
 * JWT Utility
 * Lightweight utility to parse JWTs and check expiration without external deps
 */

interface JwtPayload {
    exp?: number;
    iat?: number;
    sub?: string;
    [key: string]: any;
}

export const JwtUtils = {
    decode: (token: string): JwtPayload | null => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                window
                    .atob(base64)
                    .split('')
                    .map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Failed to decode JWT", e);
            return null;
        }
    },

    isExpired: (token: string): boolean => {
        const payload = JwtUtils.decode(token);
        if (!payload || !payload.exp) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        // Add a safety buffer of 10 seconds
        return payload.exp - 10 < currentTime;
    }
};
