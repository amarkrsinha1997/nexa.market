import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // Optional: Add CRON_SECRET check here if needed later
        // const authHeader = req.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //   return new NextResponse('Unauthorized', { status: 401 });
        // }

        // Threshold: 30 minutes ago
        const threshold = new Date(Date.now() - 30 * 60 * 1000);

        // Find orders that are still in ORDER_CREATED status and older than 30 minutes
        const result = await prisma.order.updateMany({
            where: {
                status: "ORDER_CREATED",
                createdAt: {
                    lt: threshold
                }
            },
            data: {
                status: "REJECTED"
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                expiredCount: result.count,
                threshold: threshold.toISOString(),
                message: `Expired ${result.count} stale orders`
            }
        });

    } catch (error: any) {
        console.error("Cron expiry failed", error);
        return NextResponse.json({ success: false, message: "Failed to expire orders" }, { status: 500 });
    }
}
