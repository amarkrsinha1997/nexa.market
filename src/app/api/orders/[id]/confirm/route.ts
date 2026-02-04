import { NextResponse } from "next/server";
import { OrdersService, ApiError as OrdersApiError } from "@/lib/services/orders.service";
import { AuthService, ApiError } from "@/lib/services/auth.service";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await AuthService.authenticate(req);

        const resolvedParams = await params;
        const orderId = resolvedParams.id;
        const body = await req.json();
        const { transactionId } = body;

        const updatedOrder = await OrdersService.confirmPayment(orderId, user, transactionId);

        return NextResponse.json({ success: true, data: updatedOrder });

    } catch (error: any) {
        console.error("Order confirmation failed", error);
        if (error instanceof OrdersApiError || error instanceof ApiError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await AuthService.authenticate(req);

        const resolvedParams = await params;
        const orderId = resolvedParams.id;

        const result = await OrdersService.getOrderById(orderId, user);

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error("Fetch order details failed", error);
        if (error instanceof OrdersApiError || error instanceof ApiError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
    }
}
