import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

export async function verifyAdminRequest(req: Request): Promise<{ user: User } | NextResponse> {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized: Missing Token" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];

        // Verify Google Token
        let payload;
        try {
            payload = await AuthService.verifyGoogleToken(token);
        } catch (error) {
            return NextResponse.json({ success: false, message: "Unauthorized: Invalid Token" }, { status: 401 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: payload.email }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized: User not found" }, { status: 401 });
        }

        // Verify Role
        if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
            return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
        }

        return { user };

    } catch (error) {
        console.error("Admin verification failed", error);
        return NextResponse.json({ success: false, message: "Internal Authentication Error" }, { status: 500 });
    }
}
