
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const plateNumber = 'PL-582-KN';
    console.log(`Looking up vehicle with plate: ${plateNumber}`);

    const vehicle = await prisma.vehicle.findFirst({
        where: { plateNumber },
        include: {
            compliance: {
                include: {
                    complianceItem: true
                }
            }
        }
    });

    if (!vehicle) {
        console.log('Vehicle not found!');
        return;
    }

    console.log('Vehicle found:', vehicle.make, vehicle.model, vehicle.year);
    console.log('Compliance items:', vehicle.compliance.length);

    vehicle.compliance.forEach(c => {
        console.log(`- Item: ${c.complianceItem.name}`);
        console.log(`  Status: ${c.status}`);
        console.log(`  Expiry Date: ${c.expiryDate}`);
        console.log(`  Is Expired (Code Check): ${new Date(c.expiryDate) < new Date()}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
