import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(" ")[1];
        const payload = await AuthService.verifyGoogleToken(token);

        // Check Admin Role
        const adminUser = await prisma.user.findUnique({ where: { email: payload.email } });
        if (!adminUser || adminUser.role !== "ADMIN") {
            return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
        }

        const body = await req.json();
        const { status } = body;

        if (!status || !["VERIFIED", "PAYMENT_FAILED"].includes(status)) {
            return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
        }

        // Update Order
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status: status,
                verifiedBy: adminUser.id
            }
        });

        // TODO: If VERIFIED, Trigger Token Release / Ledger Entry here
        // For now, verified status is enough for the requirement

        return NextResponse.json({ success: true, data: { order: updatedOrder } });

    } catch (error: any) {
        console.error("Order verification failed", error);
        return NextResponse.json({ success: false, message: "Failed to verify order" }, { status: 500 });
    }
}
