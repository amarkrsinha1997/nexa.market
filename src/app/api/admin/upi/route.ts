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

// Validate time format (HH:mm)
function isValidTimeFormat(time: string | null | undefined): boolean {
    if (!time) return true; // null/undefined is valid (no schedule)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
}

export async function GET(req: NextRequest) {
    if (!await verifyAdmin(req)) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    try {
        const upis = await prisma.upi.findMany({
            orderBy: [
                { isActive: 'desc' },
                { priority: 'asc' },
                { createdAt: 'desc' }
            ]
        });
        return NextResponse.json({ success: true, data: { upis } });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch UPIs" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!await verifyAdmin(req)) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    try {
        const {
            vpa,
            merchantName,
            scheduleStart,
            scheduleEnd,
            priority,
            notes,
            maxDailyLimit,
            isFallback
        } = await req.json();

        if (!vpa) return NextResponse.json({ success: false, message: "VPA is required" }, { status: 400 });

        // Validate time formats
        if (!isValidTimeFormat(scheduleStart) || !isValidTimeFormat(scheduleEnd)) {
            return NextResponse.json({
                success: false,
                message: "Invalid time format. Use HH:mm (e.g., 09:00, 17:30)"
            }, { status: 400 });
        }

        const upi = await prisma.upi.create({
            data: {
                vpa,
                merchantName,
                isActive: true,
                scheduleStart: scheduleStart || null,
                scheduleEnd: scheduleEnd || null,
                priority: priority !== undefined ? parseInt(priority) : 0,
                notes: notes || null,
                maxDailyLimit: maxDailyLimit ? parseFloat(maxDailyLimit) : null,
                isFallback: !!isFallback
            }
        });
        return NextResponse.json({ success: true, data: { upi } });
    } catch (error: any) {
        console.error("Create UPI error:", error);
        return NextResponse.json({
            success: false,
            message: error.code === 'P2002' ? "UPI ID already exists" : "Failed to create UPI"
        }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    if (!await verifyAdmin(req)) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    try {
        const { id, isActive } = await req.json();
        if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

        const upi = await prisma.upi.update({
            where: { id },
            data: { isActive: !!isActive }
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
