import { OAuth2Client } from "google-auth-library";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { User, Prisma } from "@prisma/client";

export class ApiError extends Error {
    statusCode: number;
    code: string;

    constructor(message: string, code: string = "INTERNAL_ERROR", statusCode: number = 500) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
    }
}

export const ErrorCode = {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    GOOGLE_AUTH_FAILED: "GOOGLE_AUTH_FAILED",
    INVALID_GOOGLE_TOKEN: "INVALID_GOOGLE_TOKEN",
    USER_NOT_FOUND: "USER_NOT_FOUND",
};

export interface GoogleTokenPayload {
    email: string;
    name?: string;
    picture?: string;
    sub: string;
    email_verified?: boolean;
}

export class AuthService {
    private static getGoogleClient() {
        return new OAuth2Client(
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "postmessage"
        );
    }

    static async verifyGoogleToken(token: string): Promise<GoogleTokenPayload> {
        const client = this.getGoogleClient();
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new ApiError("Invalid Google Token", ErrorCode.INVALID_GOOGLE_TOKEN, 401);
        }
        return {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            sub: payload.sub,
            email_verified: payload.email_verified
        };
    }

    private static getJwtSecret(): Uint8Array {
        const secret = process.env.JWT_SECRET || "default_super_secret_dev_key_change_in_prod";
        return new TextEncoder().encode(secret);
    }

    static async createSessionToken(user: User): Promise<string> {
        const secret = this.getJwtSecret();
        const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30d') // 30 Days expiration
            .sign(secret);
        return token;
    }

    static async verifySessionToken(token: string): Promise<any> {
        try {
            const secret = this.getJwtSecret();
            const { payload } = await jwtVerify(token, secret);
            return payload;
        } catch (error) {
            throw new ApiError("Invalid Session Token", "INVALID_TOKEN", 401);
        }
    }

    static async authenticateWithGoogle(params: {
        googleToken?: string;
        code?: string;
        referralCode?: string;
    }): Promise<{
        user: User;
        isNewUser: boolean;
        refreshToken?: string | null;
        idToken?: string | null;
        accessToken: string; // Our custom session token
    }> {
        try {
            let googlePayload: GoogleTokenPayload;
            let refreshToken: string | null = null;
            let idToken: string | null = null;

            if (params.code) {
                // Exchange authorization code for tokens
                const { tokens } = await this.getGoogleClient().getToken({
                    code: params.code,
                    redirect_uri: "postmessage",
                });

                if (!tokens.id_token) {
                    throw new ApiError("No ID token returned from Google", ErrorCode.GOOGLE_AUTH_FAILED, 401);
                }

                // Verify the ID token
                googlePayload = await this.verifyGoogleToken(tokens.id_token);
                refreshToken = tokens.refresh_token || null;
                idToken = tokens.id_token;
            } else if (params.googleToken) {
                // Legacy/Direct ID Token flow
                googlePayload = await this.verifyGoogleToken(params.googleToken);
                idToken = params.googleToken;
            } else {
                throw new ApiError("Google token or code is required", ErrorCode.VALIDATION_ERROR, 400);
            }

            // Check if user exists by email
            let user = await prisma.user.findUnique({
                where: { email: googlePayload.email },
            });
            let isNewUser = false;

            if (!user) {
                isNewUser = true;
                user = await prisma.user.create({
                    data: {
                        email: googlePayload.email,
                        name: googlePayload.name || "User",
                        googleId: googlePayload.sub,
                        picture: googlePayload.picture,
                        role: "USER",
                        refreshToken: refreshToken || undefined, // Store if available
                    }
                });
            } else {
                // Update existing user's Google info and last login
                const updateData: Prisma.UserUpdateInput = {
                    googleId: googlePayload.sub,
                    picture: googlePayload.picture,
                };
                if (refreshToken) {
                    updateData.refreshToken = refreshToken;
                }
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: updateData,
                });
            }

            const sessionToken = await this.createSessionToken(user);

            console.log("[AuthService] User authenticated", {
                userId: user.id,
                email: user.email,
                isNewUser,
                hasRefreshToken: !!refreshToken
            });

            return {
                user,
                isNewUser,
                refreshToken,
                idToken,
                accessToken: sessionToken
            };
        } catch (error: any) {
            console.error("Google authentication failed", error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(`Authentication failed: ${error.message}`, ErrorCode.GOOGLE_AUTH_FAILED, 500);
        }
    }

    static async refreshGoogleToken(refreshToken: string): Promise<{
        idToken: string;
        accessToken?: string;
        expiryDate?: number | null;
    }> {
        try {
            const client = this.getGoogleClient();
            client.setCredentials({ refresh_token: refreshToken });

            const { credentials } = await client.refreshAccessToken();

            if (!credentials.id_token) {
                throw new ApiError("Failed to refresh ID token", ErrorCode.GOOGLE_AUTH_FAILED, 401);
            }

            return {
                idToken: credentials.id_token,
                accessToken: credentials.access_token || undefined,
                expiryDate: credentials.expiry_date
            };
        } catch (error) {
            console.error("Token refresh failed", error);
            throw new ApiError("Failed to refresh token", ErrorCode.INVALID_GOOGLE_TOKEN, 401);
        }
    }

    /**
     * Authenticates the request by verifying the Bearer token and fetching the user.
     * @param req - The incoming request object.
     * @returns {Promise<User>} - The authenticated user.
     * @throws {ApiError} - If authentication fails.
     */
    static async authenticate(req: Request): Promise<User> {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            throw new ApiError("Unauthorized: Missing Token", "UNAUTHORIZED", 401);
        }

        const token = authHeader.split(" ")[1];
        let userId: string | undefined;

        // 1. Try Custom Session Token
        try {
            const payload = await this.verifySessionToken(token);
            userId = payload.userId as string;
        } catch (sessionError) {
            // 2. Fallback to Google Token (Legacy support)
            try {
                const googlePayload = await this.verifyGoogleToken(token);
                // Look up user by email since we don't have ID in Google Token
                const userByEmail = await prisma.user.findUnique({ where: { email: googlePayload.email } });
                if (!userByEmail) throw new ApiError("User not found", ErrorCode.USER_NOT_FOUND, 401);
                return userByEmail;
            } catch (googleError) {
                // Both failed
                throw new ApiError("Unauthorized: Invalid Token", ErrorCode.INVALID_GOOGLE_TOKEN, 401);
            }
        }

        if (!userId) {
            throw new ApiError("Unauthorized: Invalid Token Payload", ErrorCode.INVALID_GOOGLE_TOKEN, 401);
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new ApiError("Unauthorized: User not found", ErrorCode.USER_NOT_FOUND, 401);
        }

        return user;
    }

    /**
     * Assert that the user is an admin, otherwise throw an error.
     */
    static isAdminOrThrowError(user: User): void {
        if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
            throw new ApiError("Forbidden: Admin access required", "FORBIDDEN", 403);
        }
    }
}
