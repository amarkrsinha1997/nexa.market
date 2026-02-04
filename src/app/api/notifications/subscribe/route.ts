import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { NotificationService } from "@/lib/services/notification.service";

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
