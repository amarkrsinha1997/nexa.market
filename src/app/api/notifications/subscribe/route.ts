import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { NotificationService } from "@/lib/services/notification.service";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const user = await AuthService.authenticate(req);
        const body = await req.json();
        const { subscription } = body;
        const userAgent = req.headers.get("user-agent") || undefined;

        await NotificationService.subscribe(user.id, subscription, userAgent);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Subscription failed", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: error.statusCode || 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const user = await AuthService.authenticate(req);

        const subscription = await prisma.pushSubscription.findFirst({
            where: { userId: user.id }
        });

        return NextResponse.json({
            subscribed: !!subscription,
            endpoint: subscription?.endpoint
        });
    } catch (error: any) {
        return NextResponse.json(
            { subscribed: false },
            { status: 200 } // Return 200 even if auth fails or no sub, just say false
        );
    }
}
