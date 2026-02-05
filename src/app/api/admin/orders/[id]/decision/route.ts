import { NextResponse } from "next/server";
import { AuthService, ApiError } from "@/lib/services/auth.service";
import { OrdersService, ApiError as OrdersApiError } from "@/lib/services/orders.service";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await AuthService.authenticate(req);
        AuthService.isAdminOrThrowError(admin);

        const body = await req.json();
        const { decision, reason } = body;

        if (!decision) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const resolvedParams = await params;
        const orderId = resolvedParams.id;

        // Idempotency Check
        const currentOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (currentOrder) {
            if (decision === 'APPROVE' && (currentOrder.status === 'ADMIN_APPROVED' || currentOrder.status === 'RELEASE_PAYMENT')) {
                return NextResponse.json({ success: true, data: currentOrder });
            }
            if (decision === 'REJECT' && currentOrder.status === 'REJECTED') {
                return NextResponse.json({ success: true, data: currentOrder });
            }
        }

        const updatedOrder = await OrdersService.processDecision(orderId, admin, decision, reason);

        return NextResponse.json({ success: true, data: updatedOrder });

    } catch (error: any) {
        console.error("Order decision failed", error);
        if (error instanceof OrdersApiError || error instanceof ApiError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
    }
}
