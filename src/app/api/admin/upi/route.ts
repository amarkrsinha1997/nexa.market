import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthService } from "@/lib/services/auth.service";
import { ROLES } from "@/lib/config/roles";

// Middleware helper (simplified)
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

export async function GET(req: NextRequest) {
    if (!await verifyAdmin(req)) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    try {
        const upis = await prisma.upi.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json({ success: true, data: { upis } });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch UPIs" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!await verifyAdmin(req)) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    try {
        const { vpa, merchantName } = await req.json();
        if (!vpa) return NextResponse.json({ success: false, message: "VPA is required" }, { status: 400 });

        const upi = await prisma.upi.create({
            data: { vpa, merchantName, isActive: true }
        });
        return NextResponse.json({ success: true, data: { upi } });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to create UPI" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    if (!await verifyAdmin(req)) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    try {
        const { id, isActive } = await req.json();
        const upi = await prisma.upi.update({
            where: { id },
            data: { isActive }
        });
        return NextResponse.json({ success: true, data: { upi } });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to update UPI" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    if (!await verifyAdmin(req)) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

        await prisma.upi.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "UPI deleted" });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to delete UPI" }, { status: 500 });
    }
}
