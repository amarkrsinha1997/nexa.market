import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { ConfigService } from "@/lib/services/config.service";
import { UPIUrlBuilder } from "@/lib/utils/upi-url-builder";
import { prisma } from "@/lib/prisma";

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

        // Fetch NEXA price and calculate amount
        const nexaPrice = await ConfigService.getNexaPrice();
        const nexaAmount = await ConfigService.calculateNexaFromINR(amountINR);

        // Select Random Active QR from DB
        console.log("Fetching active UPIs...");

        // Verify model exists on client
        if (!prisma.upi) {
            console.error("prisma.upi is undefined! Check generated client.");
            return NextResponse.json({ success: false, message: "Server misconfiguration: UPI model missing" }, { status: 500 });
        }

        const activeUPIs = await prisma.upi.findMany({
            where: { isActive: true }
        });
        console.log(`Found ${activeUPIs.length} active UPIs:`, activeUPIs);

        if (activeUPIs.length === 0) {
            // Fallback check - print all UPIs
            const alld = await prisma.upi.findMany();
            console.log("All UPIs in DB:", alld);
            return NextResponse.json({ success: false, message: "No active payment methods available" }, { status: 503 });
        }

        const selectedUPI = activeUPIs[Math.floor(Math.random() * activeUPIs.length)];
        const randomQr = selectedUPI.vpa;

        // Create Order
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                amountINR: parseFloat(amountINR),
                nexaAmount: parseFloat(nexaAmount.toFixed(2)),
                nexaPrice: nexaPrice,
                paymentQrId: randomQr,
                status: "ORDER_CREATED"
            }
        });

        // Construct UPI String using UPIUrlBuilder with user email and order ID
        const upiString = new UPIUrlBuilder(randomQr)
            .setPayeeName("nexa.org")
            .setAmount(parseFloat(amountINR))
            .setCurrency("INR")
            .setTransactionNote(`${user.email} | Order: ${order.id.slice(0, 8)}`)
            .setTransactionRef(order.id)
            .build();

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

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
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
            }),
            prisma.order.count({ where: { userId: user.id } })
        ]);

        const hasMore = skip + orders.length < total;

        return NextResponse.json({ success: true, data: { orders, hasMore, total } });

    } catch (error: any) {
        console.error("Fetch orders failed", error);
        return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
    }
}
