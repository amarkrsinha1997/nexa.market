import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

// Initialize VAPID keys
// In a real app, these must be set. We'll use defaults or throw if missing in production.
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
    webpush.setVapidDetails(
        "mailto:support@nexa.market",
        VAPID_PUBLIC,
        VAPID_PRIVATE
    );
} else {
    console.warn("VAPID keys not set. Push notifications will not work.");
}

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export class NotificationService {
    /**
     * Subscribe a user to push notifications
     */
    static async subscribe(userId: string, subscription: any, userAgent?: string) {
        if (!userId || !subscription || !subscription.endpoint) {
            throw new Error("Invalid subscription data");
        }

        // Check if THIS specific endpoint already exists (e.g. same browser)
        const existingEndpoint = await prisma.pushSubscription.findUnique({
            where: { endpoint: subscription.endpoint }
        });

        if (existingEndpoint) {
            // Update user association if changed
            if (existingEndpoint.userId !== userId) {
                await prisma.pushSubscription.update({
                    where: { id: existingEndpoint.id },
                    data: { userId }
                });
            }
            return existingEndpoint;
        }

        // STRICT REQUIREMENT: Only 1 row per user.
        // Check if user has ANY other subscription
        const existingUserSub = await prisma.pushSubscription.findFirst({
            where: { userId }
        });

        if (existingUserSub) {
            // Update the existing subscription with the NEW endpoint/keys
            // This effectively "moves" the subscription to the new device/browser
            // and keeps db cleanup.
            return await prisma.pushSubscription.update({
                where: { id: existingUserSub.id },
                data: {
                    endpoint: subscription.endpoint,
                    keys: subscription.keys || {},
                    userAgent,
                    updatedAt: new Date() // bumping update time
                }
            });
        }

        // Create new if none exists
        return await prisma.pushSubscription.create({
            data: {
                userId,
                endpoint: subscription.endpoint,
                keys: subscription.keys || {},
                userAgent
            }
        });
    }

    /**
     * Send a notification to a specific user
     */
    static async sendToUser(
        userId: string,
        title: string,
        message: string,
        type: NotificationType = "INFO",
        link?: string
    ) {
        // 1. Fetch user's subscriptions
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        });

        // 3. Send Push
        const payload = JSON.stringify({
            title,
            body: message,
            url: link,
            icon: "/icons/icon-192x192.png", // Ensure this exists or use logo
            badge: "/icons/badge-72x72.png"   // Optional
        });

        const promises = subscriptions.map(async (sub) => {
            try {
                console.log(`[NotificationService] Sending push to ${sub.id} (user: ${userId})`);
                const response = await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: sub.keys as any
                    },
                    payload
                );
                console.log(`[NotificationService] Push sent: ${response.statusCode}`);
            } catch (error: any) {
                console.error(`[NotificationService] Failed to send push to ${sub.id}`, error);
                if (error.statusCode === 410 || error.statusCode === 404) {
                    // Subscription expired/gone
                    await prisma.pushSubscription.delete({ where: { id: sub.id } });
                }
            }
        });

        await Promise.all(promises);
        return true;
    }

    /**
     * Broadcast to all Admins
     */
    static async sendToAdmins(
        title: string,
        message: string,
        type: NotificationType = "INFO",
        link?: string
    ) {
        // Find all admins
        const admins = await prisma.user.findMany({
            where: {
                role: { in: ["ADMIN", "SUPERADMIN"] }
            },
            select: { id: true }
        });

        if (admins.length === 0) return;

        // Send to each admin
        const promises = admins.map(admin =>
            this.sendToUser(admin.id, title, message, type, link)
        );

        await Promise.all(promises);
    }
}
