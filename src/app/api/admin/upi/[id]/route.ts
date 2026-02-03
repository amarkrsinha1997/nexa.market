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

function isValidTimeFormat(time: string | null | undefined): boolean {
    if (!time) return true;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const {
            vpa,
            merchantName,
            isActive,
            scheduleStart,
            scheduleEnd,
            priority,
            notes,
            maxDailyLimit,
            isFallback
        } = await req.json();

        if (!vpa) {
            return NextResponse.json({ success: false, message: "VPA is required" }, { status: 400 });
        }

        // Validate time formats
        if (!isValidTimeFormat(scheduleStart) || !isValidTimeFormat(scheduleEnd)) {
            return NextResponse.json({
                success: false,
                message: "Invalid time format. Use HH:mm (e.g., 09:00, 17:30)"
            }, { status: 400 });
        }

        const upi = await prisma.upi.update({
            where: { id },
            data: {
                vpa,
                merchantName: merchantName || null,
                isActive: isActive !== undefined ? !!isActive : true,
                scheduleStart: scheduleStart || null,
                scheduleEnd: scheduleEnd || null,
                priority: priority !== undefined ? parseInt(priority) : 0,
                notes: notes || null,
                maxDailyLimit: maxDailyLimit ? parseFloat(maxDailyLimit) : null,
                isFallback: isFallback !== undefined ? !!isFallback : false
            }
        });

        return NextResponse.json({ success: true, data: { upi } });
    } catch (error: any) {
        console.error("Update UPI error:", error);
        return NextResponse.json({
            success: false,
            message: error.code === 'P2002' ? "UPI ID already exists" : "Failed to update UPI"
        }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        await prisma.upi.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "UPI deleted" });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to delete UPI" }, { status: 500 });
    }
}
