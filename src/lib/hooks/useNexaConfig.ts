import { useState, useEffect } from "react";
import { PriceSchedulerService } from "@/lib/services/price-scheduler.service";

interface NexaConfig {
    price: number | null;
    inrLimit: number | null;
}

/**
 * Hook to get and subscribe to NEXA config updates
 * Automatically fetches from cache and listens for updates
 */
export function useNexaConfig(): NexaConfig {
    const [config, setConfig] = useState<NexaConfig>({
        price: null,
        inrLimit: null
    });

    useEffect(() => {
        // Ensure scheduler is running
        PriceSchedulerService.initialize();

        // Get initial cached config
        const price = PriceSchedulerService.getCachedPrice();
        const inrLimit = PriceSchedulerService.getCachedInrLimit();

        if (price !== null && inrLimit !== null) {
            setConfig({ price, inrLimit });
        } else {
            // If cache is incomplete, force fetch immediately
            (async () => {
                const fetched = await PriceSchedulerService.forceFetch();
                if (fetched) {
                    setConfig({
                        price: fetched.price,
                        inrLimit: fetched.inrLimit
                    });
                }
            })();
        }

        // Listen for config updates
        const handleConfigUpdate = (event: CustomEvent<{ price: number; inrLimit: number }>) => {
            setConfig({
                price: event.detail.price,
                inrLimit: event.detail.inrLimit
            });
        };

        window.addEventListener("nexa-config-updated", handleConfigUpdate as EventListener);

        return () => {
            window.removeEventListener("nexa-config-updated", handleConfigUpdate as EventListener);
        };
    }, []);

    return config;
}
