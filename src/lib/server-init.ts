import { BlockchainService } from "@/lib/services/blockchain.service";

/**
 * Server-side Initialization
 * This script is imported in key server-side entry points to warm up services
 * like the Nexa blockchain wallet, reducing latency for the first user actions.
 */
let isInitialized = false;

export async function initializeServerServices() {
    if (isInitialized) return;

    console.log("🚀 [ServerInit] Warming up services...");

    // Proactively initialize Blockchain Service
    try {
        await BlockchainService.instance();
        console.log("✅ [ServerInit] Blockchain Service warmed up");
    } catch (error) {
        console.error("❌ [ServerInit] Blockchain warm-up failed:", error);
    }

    isInitialized = true;
}

// Side effect: Start initialization as soon as this is imported in a server context
if (typeof window === "undefined") {
    initializeServerServices().catch(console.error);
}
