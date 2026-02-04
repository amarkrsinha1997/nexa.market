import { NextResponse } from "next/server";
import { AuthService, ApiError } from "@/lib/services/auth.service";
import { OrdersService, ApiError as OrdersApiError } from "@/lib/services/orders.service";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await AuthService.authenticate(req);
        AuthService.isAdminOrThrowError(admin);

        const resolvedParams = await params;
        const orderId = resolvedParams.id;

        const result = await OrdersService.reprocessPayment(orderId, admin);

        return NextResponse.json({
            success: result.success,
            data: result.order,
            message: result.message || 'Payment processed successfully'
        });

    } catch (error: any) {
        console.error("[PaymentReprocess] Error:", error);
        if (error instanceof OrdersApiError || error instanceof ApiError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
    }
}
