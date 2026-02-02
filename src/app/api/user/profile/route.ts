import { NextRequest, NextResponse } from "next/server";
import { AuthService, ApiError } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";
import { Address } from "libnexa-ts";

export async function PATCH(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];

        // Verify Google ID Token
        const payload = await AuthService.verifyGoogleToken(token);

        const body = await req.json();
        const { dateOfBirth, phoneNumber, nexaWalletAddress } = body;

        // Validation
        if (nexaWalletAddress) {
            // Validate Nexa Address using libnexa-ts
            try {
                const isValid = Address.isValid(nexaWalletAddress);
                if (!isValid) {
                    return NextResponse.json({ success: false, message: "Invalid Nexa Wallet Address" }, { status: 400 });
                }
            } catch (e) {
                // Library might throw on empty or malformed input
                console.error("Nexa Validation Error", e);
                return NextResponse.json({ success: false, message: "Invalid Nexa Wallet Address Format" }, { status: 400 });
            }
        }

        const user = await prisma.user.update({
            where: { email: payload.email },
            data: {
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                phoneNumber,
                nexaWalletAddress
            }
        });

        return NextResponse.json({ success: true, data: { user } });

    } catch (error: any) {
        console.error("Profile update failed", error);
        const status = error instanceof ApiError ? error.statusCode : 500;
        const message = error.message || "Error updating profile";
        return NextResponse.json({ success: false, message }, { status });
    }
}
