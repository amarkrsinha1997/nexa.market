import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { ConfigService } from "@/lib/services/config.service";
import { UPISelectorService } from "@/lib/services/upi-selector.service";
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

        if (!user.nexaWalletAddress) {
            return NextResponse.json({ success: false, message: "Please save your Nexa wallet address in your profile first." }, { status: 400 });
        }

        const nexaAddress = user.nexaWalletAddress;

        // Fetch NEXA price and calculate amount
        const nexaPrice = await ConfigService.getNexaPrice();
        const nexaAmount = await ConfigService.calculateNexaFromINR(amountINR);

        // Select Random Active QR from DB
        console.log("Fetching active UPIs...");

        // Select UPI using intelligent routing
        const selectedUPI = await UPISelectorService.selectUPI();
        console.log('Selected UPI:', selectedUPI);

        if (!selectedUPI) {
            console.warn('No UPI available (either inactive, outside schedule, or none exist)');
            return NextResponse.json({
                success: false,
                message: "No payment methods available at this time. Please try again later."
            }, { status: 503 });
        }

        const randomQr = selectedUPI.vpa;

        // Create Order
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                amountINR: parseFloat(amountINR),
                nexaAmount: parseFloat(nexaAmount.toFixed(2)),
                nexaPrice: nexaPrice,
                paymentQrId: randomQr,
                nexaAddress: nexaAddress,
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
        const statusFilter = searchParams.get("status");

        const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";

        // Admin View: Fetch all orders (with user details)
        // User View: Fetch only own orders
        let whereClause: any = isAdmin ? {} : { userId: user.id };

        // Apply admin status filtering on server side
        if (isAdmin && statusFilter) {
            if (statusFilter === "pending") {
                whereClause.status = { in: ["VERIFICATION_PENDING", "VERIFYING", "ADMIN_APPROVED"] };
                // Optionally exclude failed ones from pending if you want them strictly separate, 
                // but usually pending means anything not final. 
                // Let's exclude ones with failureReason to avoid clutter if they are in the other tab?
                // For now, let's keep them in pending too so they aren't lost if filter is just 'pending'.
            } else if (statusFilter === "released") {
                whereClause.status = { in: ["RELEASE_PAYMENT"] };
            } else if (statusFilter === "rejected") {
                whereClause.status = "REJECTED";
            } else if (statusFilter === "transfer_failed") {
                whereClause.status = "ADMIN_APPROVED";
                whereClause.paymentFailureReason = { not: null };
            }
        }

        const includeClause = isAdmin ? { user: { select: { name: true, email: true, picture: true, phoneNumber: true } } } : undefined;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: includeClause, // Use include for relations
                // select: ... // Can't use select and include together easily without nesting select inside include. 
                // Let's use include for user and implicit select of order fields (or explicit if needed, but implicit is fine for now)
            }),
            prisma.order.count({ where: whereClause })
        ]);

        const hasMore = skip + orders.length < total;

        return NextResponse.json({ success: true, data: { orders, hasMore, total } });

    } catch (error: any) {
        console.error("Fetch orders failed", error);
        return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
    }
}
