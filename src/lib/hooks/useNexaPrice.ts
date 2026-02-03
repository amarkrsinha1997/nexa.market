import { useState, useEffect } from "react";
import { PriceSchedulerService } from "@/lib/services/price-scheduler.service";

/**
 * Hook to get and subscribe to NEXA price updates
 * Automatically fetches from cache and listens for updates
 */
export function useNexaPrice(): number | null {
    const [price, setPrice] = useState<number | null>(null);

    useEffect(() => {
        // Ensure scheduler is running
        PriceSchedulerService.initialize();

        // Get initial cached price
        const cachedPrice = PriceSchedulerService.getCachedPrice();
        if (cachedPrice) {
            setPrice(cachedPrice);
        } else {
            // If no cache, force fetch immediately
            (async () => {
                const fetchedPrice = await PriceSchedulerService.forceFetch();
                if (fetchedPrice) {
                    setPrice(fetchedPrice);
                }
            })();
        }

        // Listen for price updates
        const handlePriceUpdate = (event: CustomEvent<{ price: number }>) => {
            setPrice(event.detail.price);
        };

        window.addEventListener("nexa-price-updated", handlePriceUpdate as EventListener);

        return () => {
            window.removeEventListener("nexa-price-updated", handlePriceUpdate as EventListener);
        };
    }, []);

    return price;
}
