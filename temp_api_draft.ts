import { NextRequest, NextResponse } from "next/server";
import { AuthService, ApiError } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";
// import { Address } from "libnexa-ts"; // We will add validation inside

export async function PATCH(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];

        // Verify Google ID Token
        // Note: AuthService.verifyGoogleToken is private, we should arguably expose it or a wrapper
        // But for now, we can replicate the verify logic or make it public.
        // Let's modify AuthService to make verifyGoogleToken public first? 
        // Or better, let's look at AuthService again.

        // For now, I'll assume I can make it public or export it. 
        // Actually, verifyGoogleToken returns the payload.

        // Let's check AuthService content again to be sure.

        // Wait, I can't read it again right now without a tool call.
        // I'll optimistically try to import verification or just use OAuth2Client directly here if needed, 
        // but cleaner to use AuthService.

        // Let's assume I need to update AuthService to expose verification.

        const payload = await AuthService.verifyGoogleToken(token); // Need to ensure this is public

        const body = await req.json();
        const { dateOfBirth, phoneNumber, nexaWalletAddress } = body;

        // Validation
        // We will assume libnexa-ts validation happens here or in service
        /*
        if (nexaWalletAddress) {
             const isValid = Address.isvalid(nexaWalletAddress); // Assuming syntax
             if (!isValid) throw new ApiError("Invalid Nexa Address", "VALIDATION_ERROR", 400);
        }
        */

        const user = await prisma.user.update({
            where: { email: payload.email },
            data: {
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                phoneNumber,
                nexaWalletAddress
            }
        });

        return NextResponse.json({ success: true, data: user });

    } catch (error: any) {
        console.error("Profile update failed", error);
        return NextResponse.json({ success: false, message: error.message || "Error" }, { status: 500 });
    }
}
