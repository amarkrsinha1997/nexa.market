import { NextResponse } from "next/server";
import { ConfigService } from "@/lib/services/config.service";

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
        const body = await req.json();
        const { pricePerCrore } = body;

        if (!pricePerCrore || typeof pricePerCrore !== 'number') {
            return NextResponse.json({ success: false, message: "Invalid pricePerCrore" }, { status: 400 });
        }

        await ConfigService.setNexaPrice(pricePerCrore);
        return NextResponse.json({ success: true, message: "Price updated successfully" });
    } catch (error) {
        console.error("Config update failed", error);
        return NextResponse.json({ success: false, message: "Failed to update config" }, { status: 500 });
    }
}
