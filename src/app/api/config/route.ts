import { NextResponse } from "next/server";
import { ConfigService } from "@/lib/services/config.service";
import { AuthService, ApiError } from "@/lib/services/auth.service";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const price = await ConfigService.getNexaPrice();
        return NextResponse.json({ success: true, data: { price } });
    } catch (error) {
        console.error("Config fetch failed", error);
        return NextResponse.json({ success: false, message: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await AuthService.authenticate(req);
        AuthService.isAdminOrThrowError(user);

        const body = await req.json();
        const { pricePerCrore } = body;

        if (!pricePerCrore || typeof pricePerCrore !== 'number') {
            return NextResponse.json({ success: false, message: "Invalid pricePerCrore" }, { status: 400 });
        }

        await ConfigService.setNexaPrice(pricePerCrore);
        return NextResponse.json({ success: true, message: "Price updated successfully" });
    } catch (error: any) {
        console.error("Config update failed", error);
        if (error instanceof ApiError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, message: "Failed to update config" }, { status: 500 });
    }
}
