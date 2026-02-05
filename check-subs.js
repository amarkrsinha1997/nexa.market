
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const subscriptions = await prisma.pushSubscription.findMany({
        include: {
            user: true
        }
    });

    console.log(`Found ${subscriptions.length} subscriptions.`);
    subscriptions.forEach(sub => {
        console.log(`- User: ${sub.user.email} (${sub.userId})`);
        console.log(`  Endpoint: ${sub.endpoint.slice(0, 50)}...`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
