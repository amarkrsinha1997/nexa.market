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
