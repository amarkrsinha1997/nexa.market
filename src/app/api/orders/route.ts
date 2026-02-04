import { NextRequest, NextResponse } from "next/server";
import { OrdersService, ApiError as OrdersApiError } from "@/lib/services/orders.service";
import { AuthService, ApiError } from "@/lib/services/auth.service";

export async function POST(req: NextRequest) {
    try {
        const user = await AuthService.authenticate(req);
        const body = await req.json();
        const { amountINR } = body;

        const result = await OrdersService.createOrder(user.id, amountINR);

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error("Order creation failed", error);
        if (error instanceof OrdersApiError || error instanceof ApiError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await AuthService.authenticate(req);

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const statusFilter = searchParams.get("status");

        const result = await OrdersService.getOrders(user, page, limit, statusFilter);

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error("Fetch orders failed", error);
        if (error instanceof OrdersApiError || error instanceof ApiError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
    }
}
