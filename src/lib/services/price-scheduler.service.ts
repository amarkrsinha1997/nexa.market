import { apiClient } from "@/lib/api/client";

const FETCH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

interface ConfigCache {
    price: number | null;
    inrLimit: number | null;
}

/**
 * Config Scheduler Service
 * Fetches NEXA config from API every 10 minutes and caches it in memory
 */
export class PriceSchedulerService {
    private static intervalId: NodeJS.Timeout | null = null;
    private static isInitialized = false;
    private static config: ConfigCache = {
        price: null,
        inrLimit: null
    };

    /**
     * Initialize the config scheduler
     */
    static initialize(): void {
        if (typeof window === "undefined") return; // Skip on server-side
        if (this.isInitialized) return; // Already initialized

        this.startScheduler();

        // Listen for page visibility changes
        document.addEventListener("visibilitychange", this.handleVisibilityChange);

        this.isInitialized = true;
    }

    /**
     * Start the config fetching scheduler
     */
    private static startScheduler(): void {
        // Fetch immediately on start
        this.fetchAndCacheConfig();

        // Set up interval for periodic fetching
        this.intervalId = setInterval(() => {
            this.fetchAndCacheConfig();
        }, FETCH_INTERVAL);

        console.log("✅ NEXA Config Scheduler started (In-Memory)");
    }

    /**
     * Stop the scheduler
     */
    private static stopScheduler(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log("⏹️ NEXA Config Scheduler stopped");
    }

    /**
     * Fetch config from API and cache it in memory
     */
    private static async fetchAndCacheConfig(): Promise<void> {
        try {
            const res = await apiClient.get<{ price: number; inrLimit: number }>("/config");

            if (res.success && res.data) {
                this.config = {
                    price: res.data.price,
                    inrLimit: res.data.inrLimit
                };

                // Dispatch custom event to notify all components
                window.dispatchEvent(new CustomEvent("nexa-config-updated", {
                    detail: { price: res.data.price, inrLimit: res.data.inrLimit }
                }));

                // Keep old event for backward compatibility if any components use it
                window.dispatchEvent(new CustomEvent("nexa-price-updated", {
                    detail: { price: res.data.price }
                }));

                console.log(`💰 NEXA Config updated (In-Memory): Price ${res.data.price} INR, Limit ${res.data.inrLimit} INR`);
            }
        } catch (error) {
            console.error("Failed to fetch NEXA config:", error);
        }
    }

    /**
     * Get cached price
     * @returns Cached price or null if not available
     */
    static getCachedPrice(): number | null {
        return this.config.price;
    }

    /**
     * Get cached INR limit
     * @returns Cached limit or null if not available
     */
    static getCachedInrLimit(): number | null {
        return this.config.inrLimit;
    }

    /**
     * Handle page visibility changes
     * Stop scheduler when page is hidden, restart when visible
     */
    private static handleVisibilityChange = (): void => {
        if (document.hidden) {
            // Page is hidden, stop scheduler
            if (PriceSchedulerService.intervalId) {
                PriceSchedulerService.stopScheduler();
            }
        } else {
            // Page is visible again, restart
            PriceSchedulerService.startScheduler();
        }
    };

    /**
     * Cleanup on unmount
     */
    static cleanup(): void {
        this.stopScheduler();
        document.removeEventListener("visibilitychange", this.handleVisibilityChange);
        this.isInitialized = false;
    }

    /**
     * Force fetch config immediately
     */
    static async forceFetch(): Promise<{ price: number; inrLimit: number } | null> {
        await this.fetchAndCacheConfig();
        if (this.config.price !== null && this.config.inrLimit !== null) {
            return { price: this.config.price, inrLimit: this.config.inrLimit };
        }
        return null;
    }
}
