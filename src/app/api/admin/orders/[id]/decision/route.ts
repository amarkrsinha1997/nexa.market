import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/utils/admin-auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1. Verify Admin Auth
        const authResult = await verifyAdminRequest(req);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user: admin } = authResult;

        const body = await req.json();
        const { decision, reason } = body;
        // decision: 'APPROVE' | 'REJECT'

        if (!decision) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const resolvedParams = await params;
        const orderId = resolvedParams.id;

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        // Validate Lock - Allow SUPERADMIN to override
        const isSuperadminOverride = order.checkedBy !== admin.id && admin.role === "SUPERADMIN";
        if (order.checkedBy !== admin.id && admin.role !== "SUPERADMIN") {
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
