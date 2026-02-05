
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";
import { NotificationService } from "@/lib/services/notification.service";

export async function GET(req: Request) {
    try {
        const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

        const subscriptionCount = await prisma.pushSubscription.count();
        const subscriptions = await prisma.pushSubscription.findMany({
            take: 5,
            include: { user: { select: { email: true } } }
        });

        // Test VAPID setup
        let vapidStatus = "OK";
        try {
            if (!vapidPublic || !vapidPrivate) throw new Error("Missing keys");
            webpush.setVapidDetails(
                "mailto:support@nexa.market",
                vapidPublic,
                vapidPrivate
            );
        } catch (e: any) {
            vapidStatus = `Error: ${e.message}`;
        }

        return NextResponse.json({
            vapidPublic: vapidPublic ? `${vapidPublic.slice(0, 10)}...` : "MISSING",
            vapidPrivate: vapidPrivate ? "PRESENT" : "MISSING",
            vapidStatus,
            subscriptionCount,
            sampleSubscriptions: subscriptions.map(s => ({
                id: s.id,
                user: s.user.email,
                endpoint: s.endpoint.slice(0, 20) + "..."
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        let targetUserId = userId;
        // If no userId provided, try to find a subscription's user
        if (!targetUserId) {
            const sub = await prisma.pushSubscription.findFirst();
            if (sub) targetUserId = sub.userId;
        }

        if (!targetUserId) {
            return NextResponse.json({ error: "No user found to test with" }, { status: 400 });
        }



        console.log(`Sending test notification to ${targetUserId}`);
        await NotificationService.sendToUser(
            targetUserId,
            "Test Notification",
            "This is a test notification from the debug tool.",
            "INFO",
            "/admin/ledger"
        );

        return NextResponse.json({ success: true, message: `Sent to ${targetUserId}` });
    } catch (error: any) {
        console.error("Test notification failed", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
