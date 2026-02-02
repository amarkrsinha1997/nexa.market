/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { AuthService, ApiError } from "@/lib/services/auth.service";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { refreshToken } = body;

        if (!refreshToken) {
            return NextResponse.json({ success: false, message: "Refresh token is required" }, { status: 400 });
        }

        const result = await AuthService.refreshGoogleToken(refreshToken);

        return NextResponse.json({
            success: true,
            data: {
                idToken: result.idToken,
                accessToken: result.accessToken,
                expiryDate: result.expiryDate,
            },
            message: "Token refreshed successfully",
        });

    } catch (error: any) {
        console.error("Refresh Error:", error);
        const status = error instanceof ApiError ? error.statusCode : 500;
        const message = error.message || "Internal server error";
        return NextResponse.json({ success: false, message }, { status });
    }
}
