import { NextRequest, NextResponse } from "next/server";
import { OrdersService, ApiError as OrdersApiError } from "@/lib/services/orders.service";
import { AuthService, ApiError } from "@/lib/services/auth.service";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await AuthService.authenticate(req);
        const { id: orderId } = await params;

        const result = await OrdersService.getOrderById(orderId, user);

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error("Fetch order failed", error);
        if (error instanceof OrdersApiError || error instanceof ApiError) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: error.statusCode }
            );
        }
        return NextResponse.json(
            { success: false, message: "Failed to fetch order" },
            { status: 500 }
        );
    }
}
