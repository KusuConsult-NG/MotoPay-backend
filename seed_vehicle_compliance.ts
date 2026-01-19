
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding vehicle compliance data...');

    const vehicle = await prisma.vehicle.findUnique({
        where: { plateNumber: 'PL-582-KN' },
    });

    if (!vehicle) {
        console.error('Vehicle PL-582-KN not found. Run the main seed first.');
        return;
    }

    // Ensure we have all necessary compliance items
    const itemsToCreate = [
        {
            name: 'Proof of Ownership',
            description: 'Proof of vehicle ownership certificate',
            vehicleCategory: 'PRIVATE',
            price: 5000,
            isMandatory: true,
            validityPeriodDays: 365,
            isLocked: false,
        },
        // Others should already exist from main seed, but we can upsert checks
        {
            name: 'Vehicle License', // Mapping for VEHICLE_LICENSE
            description: 'Annual vehicle license renewal',
            vehicleCategory: 'PRIVATE',
            price: 12500,
            isMandatory: true,
            validityPeriodDays: 365,
            isLocked: false,
        }
    ];

    for (const item of itemsToCreate) {
        await prisma.complianceItem.upsert({
            where: {
                name_vehicleCategory: {
                    name: item.name,
                    vehicleCategory: item.vehicleCategory as any,
                }
            },
            update: {},
            create: item as any,
        });
    }

    // Now get the items we want to link
    const itemNames = [
        'Vehicle License',
        'Annual Road Worthiness',
        'Statutory Insurance (Third Party)',
        'Proof of Ownership'
    ];

    const complianceItems = await prisma.complianceItem.findMany({
        where: {
            name: { in: itemNames },
            vehicleCategory: 'PRIVATE'
        }
    });

    console.log(`Found ${complianceItems.length} compliance items to link.`);

    // Create expired compliance records
    const expiredDate = new Date();
    expiredDate.setFullYear(expiredDate.getFullYear() - 1); // 1 year ago

    for (const item of complianceItems) {
        await prisma.vehicleCompliance.create({
            data: {
                vehicleId: vehicle.id,
                complianceItemId: item.id,
                status: 'EXPIRED',
                issueDate: new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
                expiryDate: expiredDate,
            }
        });
        console.log(`Created expired compliance for: ${item.name}`);
    }

    console.log('✅ Vehicle compliance seeded successfully.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
