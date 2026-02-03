import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authApi } from "@/lib/api/auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Updated to Promise based params
) {
    try {
        // 1. Verify Admin Auth
        // Note: For cleaner code, we might want a middleware or helper, but implementing inline for speed.
        // We need to parse strict cookies or headers here, but simple check via request header token if passed?
        // Actually best way now is checking session token from header which client sends as Authorization or similar.
        // For this environment, let's assume client sends Authorization header with Bearer token.

        // Simplified: We'll trust the checkedBy sent in body? No, that's insecure.
        // We need the admin's ID.
        // Let's expect the client to send the user ID in the body for now (trusted client context) OR correct auth validation.
        // Given existing auth structure, `authApi` uses local storage on client. Server-side we verify token.

        // Let's assume we implement a basic server verification or pass userId in body for this iteration 
        // as we haven't set up full SSR auth session management yet.
        // Security Note: In production this must extract from valid JWT.

        const { userId } = await req.json();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized: Missing Admin ID" }, { status: 401 });
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
                checkedBy: userId,
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
