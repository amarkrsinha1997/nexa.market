import { prisma } from './src/lib/prisma'

async function main() {
    // Update all PAYMENT_PENDING to VERIFICATION_PENDING
    const result = await prisma.$executeRaw`
        UPDATE "Order" 
        SET status = 'VERIFICATION_PENDING'::text
        WHERE status = 'PAYMENT_PENDING'::text
    `;

    console.log(`Updated ${result} orders from PAYMENT_PENDING to VERIFICATION_PENDING`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
