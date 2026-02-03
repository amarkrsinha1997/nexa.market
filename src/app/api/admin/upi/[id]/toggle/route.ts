import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthService } from "@/lib/services/auth.service";
import { ROLES } from "@/lib/config/roles";

async function verifyAdmin(req: NextRequest) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    try {
        const payload = await AuthService.verifyGoogleToken(authHeader.split(" ")[1]);
        const user = await prisma.user.findUnique({ where: { email: payload.email } });
        if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.SUPERADMIN)) return null;
        return user;
    } catch (e) {
        return null;
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;

        // Get current UPI state
        const upi = await prisma.upi.findUnique({ where: { id } });
        if (!upi) {
            return NextResponse.json({ success: false, message: "UPI not found" }, { status: 404 });
        }

        // Toggle isActive
        const updatedUPI = await prisma.upi.update({
            where: { id },
            data: { isActive: !upi.isActive }
        });

        return NextResponse.json({ success: true, data: { upi: updatedUPI } });
    } catch (error) {
        console.error("Toggle UPI error:", error);
        return NextResponse.json({ success: false, message: "Failed to toggle UPI" }, { status: 500 });
    }
}
