import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await req.json();
        const { userId, decision, reason } = body;
        // decision: 'APPROVE' | 'REJECT'

        if (!userId || !decision) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Verify admin role
        const admin = await prisma.user.findUnique({ where: { id: userId } });
        if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPERADMIN")) {
            return NextResponse.json({ success: false, message: "Unauthorized: Admin access required" }, { status: 403 });
        }

        const resolvedParams = await params;
        const orderId = resolvedParams.id;

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        // Validate Lock - Allow SUPERADMIN to override
        const isSuperadminOverride = order.checkedBy !== userId && admin.role === "SUPERADMIN";
        if (order.checkedBy !== userId && admin.role !== "SUPERADMIN") {
            return NextResponse.json({ success: false, message: "You are not the checking admin for this order" }, { status: 403 });
        }

        let newStatus: any = order.status;
        if (decision === 'APPROVE') {
            newStatus = 'ADMIN_APPROVED';
        } else if (decision === 'REJECT') {
            newStatus = 'REJECTED';
        } else {
            return NextResponse.json({ success: false, message: "Invalid decision" }, { status: 400 });
        }

        // Create lifecycle event with full admin details
        const currentLifecycle = (order.lifecycle as any[]) || [];
        const lifecycleEvent = {
            status: newStatus,
            timestamp: new Date().toISOString(),
            actorId: admin.id,
            actorName: admin.name,
            actorEmail: admin.email,
            actorPicture: admin.picture,
            action: decision === 'APPROVE' ? 'APPROVE' as const : 'REJECT' as const,
            note: reason || (isSuperadminOverride ? `SUPERADMIN ${decision} (override)` : `Admin ${decision}`),
            isSuperadminOverride
        };

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: newStatus,
                lifecycle: [...currentLifecycle, lifecycleEvent],
            }
        });

        return NextResponse.json({ success: true, data: updatedOrder });

    } catch (error) {
        console.error("Order decision failed", error);
        return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
    }
}
