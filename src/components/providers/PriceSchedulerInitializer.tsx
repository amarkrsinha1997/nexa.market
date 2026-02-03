"use client";

import { useEffect } from "react";
import { PriceSchedulerService } from "@/lib/services/price-scheduler.service";

/**
 * Client-side component to initialize the NEXA price scheduler
 * This ensures the scheduler starts when the app loads
 */
export default function PriceSchedulerInitializer() {
    useEffect(() => {
        // Initialize the price scheduler
        PriceSchedulerService.initialize();

        // Cleanup on unmount
        return () => {
            PriceSchedulerService.cleanup();
        };
    }, []);

    return null; // This component doesn't render anything
}
