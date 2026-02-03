import { prisma } from "@/lib/prisma";

export class ConfigService {
    /**
     * Get NEXA price in INR (price of 1 NEXA token)
     * Default: 1 Cr NEXA (10,000,000) = 500 INR => 0.00005 INR per NEXA
     */
    static async getNexaPrice(): Promise<number> {
        let priceConfig = await prisma.appConfig.findUnique({
            where: { key: "NEXA_PRICE_INR" }
        });

        if (!priceConfig) {
            // Fallback: create default price (1 Cr NEXA = 500 INR => 0.00005 per NEXA)
            priceConfig = await prisma.appConfig.create({
                data: {
                    key: "NEXA_PRICE_INR",
                    value: "0.00005",
                    description: "Price of 1 NEXA token in INR"
                }
            });
        }

        return parseFloat(priceConfig.value);
    }

    /**
     * Calculate NEXA amount from INR amount
     * Formula: INR Amount / Price per NEXA = NEXA Count
     */
    static async calculateNexaFromINR(amountINR: number): Promise<number> {
        const nexaPrice = await this.getNexaPrice();
        return amountINR / nexaPrice;
    }
}
