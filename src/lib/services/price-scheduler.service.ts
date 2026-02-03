import { apiClient } from "@/lib/api/client";

const PRICE_CACHE_KEY = "nexa_price_cache";
const PRICE_SCHEDULER_KEY = "nexa_price_scheduler_active";
const FETCH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

interface PriceCache {
    price: number;
    lastFetched: number;
}

/**
 * Price Scheduler Service
 * Fetches NEXA price from API every 10 minutes and caches it in localStorage
 * Ensures only one scheduler instance is active across all tabs
 */
export class PriceSchedulerService {
    private static intervalId: NodeJS.Timeout | null = null;
    private static isInitialized = false;

    /**
     * Initialize the price scheduler
     * Only one instance will be active across all browser tabs
     */
    static initialize(): void {
        if (typeof window === "undefined") return; // Skip on server-side
        if (this.isInitialized) return; // Already initialized

        // Check if another tab is already running the scheduler
        const schedulerActive = localStorage.getItem(PRICE_SCHEDULER_KEY);

        if (!schedulerActive) {
            this.startScheduler();
        } else {
            // Listen for scheduler status changes from other tabs
            window.addEventListener("storage", this.handleStorageChange);
        }

        // Listen for page visibility changes
        document.addEventListener("visibilitychange", this.handleVisibilityChange);

        this.isInitialized = true;
    }

    /**
     * Start the price fetching scheduler
     */
    private static startScheduler(): void {
        // Mark this tab as the active scheduler
        localStorage.setItem(PRICE_SCHEDULER_KEY, Date.now().toString());

        // Fetch immediately on start
        this.fetchAndCachePrice();

        // Set up interval for periodic fetching
        this.intervalId = setInterval(() => {
            this.fetchAndCachePrice();
        }, FETCH_INTERVAL);

        console.log("✅ NEXA Price Scheduler started");
    }

    /**
     * Stop the scheduler
     */
    private static stopScheduler(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        localStorage.removeItem(PRICE_SCHEDULER_KEY);
        console.log("⏹️ NEXA Price Scheduler stopped");
    }

    /**
     * Fetch price from API and cache it
     */
    private static async fetchAndCachePrice(): Promise<void> {
        try {
            const res = await apiClient.get<{ price: number }>("/config");

            if (res.success && res.data?.price) {
                const cache: PriceCache = {
                    price: res.data.price,
                    lastFetched: Date.now()
                };

                localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cache));

                // Dispatch custom event to notify all components
                window.dispatchEvent(new CustomEvent("nexa-price-updated", {
                    detail: { price: res.data.price }
                }));

                console.log(`💰 NEXA Price updated: ${res.data.price} INR`);
            }
        } catch (error) {
            console.error("Failed to fetch NEXA price:", error);
        }
    }

    /**
     * Get cached price from localStorage
     * @returns Cached price or null if not available
     */
    static getCachedPrice(): number | null {
        if (typeof window === "undefined") return null;

        const cached = localStorage.getItem(PRICE_CACHE_KEY);
        if (!cached) return null;

        try {
            const cache: PriceCache = JSON.parse(cached);

            // Check if cache is still valid (within 15 minutes)
            const cacheAge = Date.now() - cache.lastFetched;
            const maxAge = 15 * 60 * 1000; // 15 minutes

            if (cacheAge < maxAge) {
                return cache.price;
            }

            return null;
        } catch {
            return null;
        }
    }

    /**
     * Handle storage changes from other tabs
     */
    private static handleStorageChange = (e: StorageEvent): void => {
        // If scheduler key was removed, this tab should take over
        if (e.key === PRICE_SCHEDULER_KEY && !e.newValue) {
            console.log("🔄 Taking over price scheduler from another tab");
            PriceSchedulerService.startScheduler();
        }
    };

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
            // Page is visible again, check if we should restart
            const schedulerActive = localStorage.getItem(PRICE_SCHEDULER_KEY);
            if (!schedulerActive) {
                PriceSchedulerService.startScheduler();
            }
        }
    };

    /**
     * Cleanup on unmount
     */
    static cleanup(): void {
        this.stopScheduler();
        window.removeEventListener("storage", this.handleStorageChange);
        document.removeEventListener("visibilitychange", this.handleVisibilityChange);
        this.isInitialized = false;
    }

    /**
     * Force fetch price immediately
     */
    static async forceFetch(): Promise<number | null> {
        await this.fetchAndCachePrice();
        return this.getCachedPrice();
    }
}
