import { prisma } from "@/lib/prisma";

/**
 * UPI Selector Service
 * Handles intelligent UPI selection based on:
 * - Active status
 * - Time-based scheduling
 * - Priority (lower is higher priority)
 * - Round-robin within same priority
 */
export class UPISelectorService {
    /**
     * Get the current time in HH:mm format (local server timezone)
     */
    private static getCurrentTime(): string {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    /**
     * Check if current time is within the schedule range
     * @param scheduleStart - Start time in HH:mm format (e.g., "09:00")
     * @param scheduleEnd - End time in HH:mm format (e.g., "17:00")
     */
    private static isWithinSchedule(scheduleStart: string | null, scheduleEnd: string | null): boolean {
        // If no schedule is set, UPI is always available
        if (!scheduleStart || !scheduleEnd) {
            return true;
        }

        const currentTime = this.getCurrentTime();

        // Handle overnight schedules (e.g., "22:00" to "06:00")
        if (scheduleStart > scheduleEnd) {
            return currentTime >= scheduleStart || currentTime <= scheduleEnd;
        }

        // Normal schedule (e.g., "09:00" to "17:00")
        return currentTime >= scheduleStart && currentTime <= scheduleEnd;
    }

    /**
     * Select the best UPI for payment based on rotation logic
     * Returns null if no UPIs are available
     */
    static async selectUPI(): Promise<{ id: string; vpa: string; merchantName: string | null } | null> {
        try {
            // Fetch all active UPIs
            const upis = await prisma.upi.findMany({
                where: { isActive: true },
                orderBy: [
                    { priority: 'asc' },      // Sort by priority first (lower = higher priority)
                    { lastUsedAt: 'asc' }      // Then by last used (older first for round-robin)
                ]
            });

            if (upis.length === 0) {
                console.warn('No active UPIs available');
                return null;
            }

            // Filter by schedule
            const availableUPIs = upis.filter(upi =>
                this.isWithinSchedule(upi.scheduleStart, upi.scheduleEnd)
            );

            if (availableUPIs.length === 0) {
                console.warn('No UPIs available within current schedule');
                return null;
            }

            // Select the first one (already sorted by priority and lastUsedAt)
            const selectedUPI = availableUPIs[0];

            // Update usage tracking
            await prisma.upi.update({
                where: { id: selectedUPI.id },
                data: {
                    lastUsedAt: new Date(),
                    usageCount: { increment: 1 }
                }
            });

            return {
                id: selectedUPI.id,
                vpa: selectedUPI.vpa,
                merchantName: selectedUPI.merchantName
            };

        } catch (error) {
            console.error('UPI selection failed:', error);
            return null;
        }
    }

    /**
     * Get statistics for all UPIs (useful for admin dashboard)
     */
    static async getUPIStats() {
        const upis = await prisma.upi.findMany({
            select: {
                id: true,
                vpa: true,
                merchantName: true,
                isActive: true,
                scheduleStart: true,
                scheduleEnd: true,
                priority: true,
                lastUsedAt: true,
                usageCount: true,
                notes: true
            },
            orderBy: [
                { isActive: 'desc' },
                { priority: 'asc' }
            ]
        });

        const currentTime = this.getCurrentTime();

        return upis.map(upi => ({
            ...upi,
            isCurrentlyAvailable: upi.isActive && this.isWithinSchedule(upi.scheduleStart, upi.scheduleEnd),
            currentTime
        }));
    }
}
