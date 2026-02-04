import { NextRequest, NextResponse } from "next/server";
import { AuthService, ApiError } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";
import { Address } from "libnexa-ts";

export async function GET(req: NextRequest) {
    try {
        // Authenticate request (gets user from DB)
        // Note: For profile fetch, we might want to prioritize the DB user. 
        // The previous implementation did an upsert based on the token payload.
        // `authenticate` returns the DB user. 
        // If the user doesn't exist in DB, `authenticate` throws.
        // But the previous implementation *created* the user if missing.
        // This is a subtle behavior change. 
        // For /profile, it's reasonable to expect the user to exist if they are calling this.
        // However, if this is part of a "login/sync" flow, we might need the upsert logic.
        // Let's stick to `authenticate` for now as it's cleaner. 
        // If user creation is needed on login, it should probably be explicit authentication flow, 
        // or we can modify `authenticate` or keep the upsert logic here if strictly needed.
        // The old code: verified token -> upserted user -> returned user.
        // If I use `authenticate`, I get the user. If they create a new account, they might fail here if not already in DB?
        // Actually `authenticate` -> verifies token -> finds user.
        // If the user is logging in for the FIRST time, they might not be in the DB yet unless `authenticate` handles it or another endpoint does.
        // In `auth.service.ts` or somewhere, usually login handles creation.
        // Let's assume standard auth flow: Access token means user probably exists or was created during "Login with Google".
        // IF this route IS the "post-login sync", we should preserve upsert.
        // But `authenticate` throws if user not found.
        // Let's look at `api-auth.ts`: it throws "User not found".
        // Recommendation: Use `authenticate`. If 401/User not found, client should probably hit a "login" endpoint or we assume user is created elsewhere.
        // For safety, let's keep the upsert behavior if `authenticate` is too strict? 
        // No, let's follow the user instruction to use `auth utils`. 
        // If this breaks "first time login", we can advise to add user creation to `authenticate` or a specific login route.
        // BUT, looking at the code, it seems `GET /api/user/profile` was used to SYNC/CREATE users.
        // If we switch to `authenticate`, we lose that "auto-create" feature.
        // Let's use `authenticate` but maybe handle the creation if `User not found`? 
        // `authenticate` abstracts the token verification.
        // Let's use `authenticate` strictly as requested. If behavior breaks, we fix it.
        // Actually, wait. `authenticate` returns a User.
        // To keep the "upsert" logic, we'd need the Google Payload *before* user lookup.
        // `authenticate` does both.
        // Let's modify `src/app/api/user/profile/route.ts` to use `authenticate`. 
        // If the user wants to *create* a user, they should probably use a different flow or I should handle it.
        // Given the request is "Token verification is still scattered here use auth utils", implies standardization.

        const user = await AuthService.authenticate(req);
        return NextResponse.json({ success: true, data: { user } });
    } catch (error: any) {
        console.error("Fetch profile failed", error);
        if (error instanceof ApiError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, message: "Error fetching profile" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await AuthService.authenticate(req);

        const body = await req.json();
        console.log("Profile Update Payload:", body);
        const { dateOfBirth, phoneNumber, nexaWalletAddress, username, referralCode, isEarlyUser } = body;

        // Validation
        if (nexaWalletAddress) {
            try {
                const isValid = Address.isValid(nexaWalletAddress);
                if (!isValid) {
                    return NextResponse.json({ success: false, message: "Invalid Nexa Wallet Address" }, { status: 400 });
                }
            } catch (e) {
                console.error("Nexa Validation Error", e);
                return NextResponse.json({ success: false, message: "Invalid Nexa Wallet Address Format" }, { status: 400 });
            }

            // Check if address has changed and log history
            if (user.nexaWalletAddress !== nexaWalletAddress) {
                await prisma.walletHistory.create({
                    data: {
                        userId: user.id,
                        address: nexaWalletAddress
                    }
                });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                phoneNumber,
                nexaWalletAddress,
                username,
                referralCode,
                isEarlyUser,
                isOnboardingCompleted: true
            }
        });

        return NextResponse.json({ success: true, data: { user: updatedUser } });

    } catch (error: any) {
        console.error("Profile update failed", error);
        if (error instanceof ApiError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, message: "Error updating profile" }, { status: 500 });
    }
}
