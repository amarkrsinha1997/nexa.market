import { NextResponse } from "next/server";

// In-memory cache
let statsCache = {
    data: null as any,
    lastUpdated: 0
};
const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function GET() {
    try {
        const now = Date.now();

        // Return cached data if valid
        if (statsCache.data && (now - statsCache.lastUpdated < CACHE_DURATION)) {
            return NextResponse.json(statsCache.data);
        }

        const [volumeRes] = await Promise.all([
            fetch("https://wallywallet.org/_api/v0/now/nex/usdt", { next: { revalidate: 60 } })
        ]);

        let volume24h = 0;
        const circulatingSupply = 9800000000000; // Hardcoded 9.8T per request

        if (volumeRes.ok) {
            const volumeData = await volumeRes.json();
            // Volume is in NEXA
            volume24h = parseFloat(volumeData.Volume || "0");
        }

        const maxSupply = 21000000000000; // 21 Trillion Max Supply

        const responseData = {
            success: true,
            data: {
                volume24h,
                circulatingSupply,
                maxSupply
            }
        };

        // Update cache
        statsCache = {
            data: responseData,
            lastUpdated: now
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("Stats fetch error:", error);
        return NextResponse.json({
            success: false,
            data: {
                volume24h: 0,
                circulatingSupply: 0,
                maxSupply: 21000000000000
            }
        });
    }
}
