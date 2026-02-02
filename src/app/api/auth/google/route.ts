/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { AuthService, ApiError } from "@/lib/services/auth.service";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { googleToken, code, referralCode } = body;

        console.log("[Google Auth Route] Received POST request");

        const result = await AuthService.authenticateWithGoogle({
            googleToken,
            code,
            referralCode,
        });

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    userId: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    role: result.user.role,
                    picture: result.user.picture,
                    isNewUser: result.isNewUser,
                },
                isNewUser: result.isNewUser,
                refreshToken: result.refreshToken,
                idToken: result.idToken,
                // We could add expiry if available, but for now strict to snippet return types
            },
            message: result.isNewUser
                ? "Account created successfully"
                : "Login successful",
        });

    } catch (error: any) {
        console.error("[Google Auth Route] Error:", error);
        const status = error instanceof ApiError ? error.statusCode : 500;
        const message = error.message || "Authentication failed";
        return NextResponse.json({ success: false, message }, { status });
    }
}
