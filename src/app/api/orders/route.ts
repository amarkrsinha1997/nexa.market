import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";

// Mock Config for QR Codes
const UPI_IDS = [
    "merchant01@upi", "merchant02@upi", "merchant03@upi", "merchant04@upi", "merchant05@upi",
    "merchant06@upi", "merchant07@upi", "merchant08@upi", "merchant09@upi", "merchant10@upi"
];

const MOCK_NEXA_PRICE_INR = 1.25;

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(" ")[1];
        const payload = await AuthService.verifyGoogleToken(token);

        // Find user
        const user = await prisma.user.findUnique({ where: { email: payload.email } });
        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        const body = await req.json();
        const { amountINR } = body;

        if (!amountINR || amountINR <= 0) {
            return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
        }

        // Calculation
        const nexaAmount = amountINR * MOCK_NEXA_PRICE_INR;

        // Select Random QR
        const randomQr = UPI_IDS[Math.floor(Math.random() * UPI_IDS.length)];

        // Create Order
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                amountINR: parseFloat(amountINR),
                nexaAmount: parseFloat(nexaAmount.toFixed(2)),
                nexaPrice: MOCK_NEXA_PRICE_INR,
                paymentQrId: randomQr,
                status: "ORDER_CREATED"
            }
        });

        // Construct UPI String (for frontend display/deeplink)
        // Format: upi://pay?pa=<upi_id>&pn=NexaMarket&am=<amount>&cu=INR&tn=<order_id>
        const upiString = `upi://pay?pa=${randomQr}&pn=NexaMarket&am=${amountINR}&cu=INR&tn=${order.id}`;

        // We will return the QR URL later when we generate QR images, for now frontend can generate using upiString

        return NextResponse.json({
            success: true,
            data: {
                orderId: order.id,
                upiId: randomQr,
                upiString,
                amountINR,
                nexaAmount
            }
        });

    } catch (error: any) {
        console.error("Order creation failed", error);
        return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(" ")[1];
        const payload = await AuthService.verifyGoogleToken(token);

        // Find user
        const user = await prisma.user.findUnique({ where: { email: payload.email } });
        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                amountINR: true,
                nexaAmount: true,
                nexaPrice: true,
                status: true,
                paymentQrId: true,
                transactionId: true,
                createdAt: true,
                verifiedBy: true
            }
        });

        return NextResponse.json({ success: true, data: { orders } });

    } catch (error: any) {
        console.error("Fetch orders failed", error);
        return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
    }
}
