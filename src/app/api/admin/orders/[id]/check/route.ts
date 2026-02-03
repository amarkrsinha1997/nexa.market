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

        // If it returned a response, it means auth failed
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user: admin } = authResult;

        const resolvedParams = await params;
        const orderId = resolvedParams.id;

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        if (order.checkedBy && admin.role !== "SUPERADMIN") {
            return NextResponse.json({ success: false, message: `Order already locked by another admin (${order.checkedBy})` }, { status: 409 });
        }

        // SUPERADMIN can override lock
        const isSuperadminOverride = order.checkedBy && admin.role === "SUPERADMIN";

        // Create lifecycle event
        const currentLifecycle = (order.lifecycle as any[]) || [];
        const lifecycleEvent = {
            status: "VERIFYING",
            timestamp: new Date().toISOString(),
            actorId: admin.id,
            actorName: admin.name,
            actorEmail: admin.email,
            actorPicture: admin.picture,
            action: "CHECK" as const,
            note: isSuperadminOverride ? `SUPERADMIN override - locked by ${order.checkedBy}` : "Admin started checking order",
            isSuperadminOverride
        };

        // Update
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                checkedBy: admin.id,
                status: "VERIFYING",
                lifecycle: [...currentLifecycle, lifecycleEvent]
            }
        });

        return NextResponse.json({ success: true, data: updatedOrder });

    } catch (error) {
        console.error("Order check failed", error);
        return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
    }
}
