import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // Optional: Add CRON_SECRET check here if needed later
        // const authHeader = req.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //   return new NextResponse('Unauthorized', { status: 401 });
        // }

        // Threshold: 24 hours ago
        const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Update stale orders
        const result = await prisma.order.updateMany({
            where: {
                createdAt: {
                    lt: threshold
                },
                status: {
                    in: ["ORDER_CREATED", "PAYMENT_INIT"]
                }
            },
            data: {
                status: "PAYMENT_FAILED"
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                failedOrdersCount: result.count,
                threshold: threshold.toISOString()
            }
        });

    } catch (error: any) {
        console.error("Cron expiry failed", error);
        return NextResponse.json({ success: false, message: "Failed to expire orders" }, { status: 500 });
    }
}
