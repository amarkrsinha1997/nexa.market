import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";

// GET Order Details
export async function GET(
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

        const order = await prisma.order.findUnique({ where: { id } });

        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        // Access Control
        const user = await prisma.user.findUnique({ where: { email: payload.email } });
        if (order.userId !== user?.id && user?.role !== "ADMIN") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Reconstruct UPI String on read (or store in DB, but calc is cheap)
        const upiString = `upi://pay?pa=${order.paymentQrId}&pn=NexaMarket&am=${order.amountINR}&cu=INR&tn=${order.id}`;

        return NextResponse.json({
            success: true,
            data: {
                order,
                upiString
            }
        });

    } catch (error: any) {
        console.error("Fetch order failed", error);
        return NextResponse.json({ success: false, message: "Error fetching order" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    // ... Existing POST Logic ...
    try {
        const { id } = await context.params;

        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(" ")[1];
        const payload = await AuthService.verifyGoogleToken(token);

        const body = await req.json();
        const { transactionId } = body;

        // Verify Order Ownership
        const order = await prisma.order.findUnique({ where: { id } });

        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        // Check if user owns order
        const user = await prisma.user.findUnique({ where: { email: payload.email } });
        if (order.userId !== user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized access to order" }, { status: 403 });
        }

        // Update Order
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status: "PAYMENT_PENDING",
                transactionId: transactionId || null
            }
        });

        return NextResponse.json({ success: true, data: { order: updatedOrder } });

    } catch (error: any) {
        console.error("Order confirmation failed", error);
        return NextResponse.json({ success: false, message: "Failed to confirm order" }, { status: 500 });
    }
}
