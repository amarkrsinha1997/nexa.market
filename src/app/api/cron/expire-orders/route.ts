import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthService } from "@/lib/services/auth.service";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        let isAuthorized = false;

        // 1. Check CRON_SECRET (if configured)
        if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
            isAuthorized = true;
        }

        // 2. Fallback: Allow authenticated Admins to trigger manually
        if (!isAuthorized) {
            try {
                const user = await AuthService.authenticate(req);
                if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
                    isAuthorized = true;
                }
            } catch (error) {
                // Ignore auth error, just means not a valid user request
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

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
