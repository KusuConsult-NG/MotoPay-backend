import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPasswordHash = await bcrypt.hash('Admin123!', 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@psirs.gov.ng' },
        update: {},
        create: {
            email: 'admin@psirs.gov.ng',
            passwordHash: adminPasswordHash,
            fullName: 'System Administrator',
            phoneNumber: '+2348012345678',
            role: 'SUPER_ADMIN',
            isActive: true,
        },
    });

    console.log('✓ Created admin user:', admin.email);

    // Create compliance items
    const complianceItems = [
        {
            name: 'Annual Road Worthiness',
            description: 'Annual vehicle road worthiness certification',
            vehicleCategory: 'PRIVATE',
            price: 12500,
            isMandatory: true,
            validityPeriodDays: 365,
            isLocked: false,
        },
        {
            name: 'Hackney Permit',
            description: 'Commercial vehicle hackney permit',
            vehicleCategory: 'COMMERCIAL',
            price: 8000,
            isMandatory: true,
            validityPeriodDays: 365,
            isLocked: false,
        },
        {
            name: 'Heavy Duty Access Fee',
            description: 'Access fee for heavy-duty commercial vehicles',
            vehicleCategory: 'TRUCK',
            price: 45000,
            isMandatory: true,
            validityPeriodDays: 365,
            isLocked: false,
        },
        {
            name: 'Statutory Insurance (Third Party)',
            description: 'Mandatory third-party insurance coverage',
            vehicleCategory: 'PRIVATE',
            price: 5000,
            isMandatory: true,
            validityPeriodDays: 365,
            isLocked: true, // Locked - requires executive approval to change
        },
        {
            name: 'Vehicle Registration Fee',
            description: 'Initial vehicle registration with Plateau State',
            vehicleCategory: 'PRIVATE',
            price: 25000,
            isMandatory: true,
            validityPeriodDays: 3650, // 10 years
            isLocked: false,
        },
        {
            name: 'Motorcycle License',
            description: 'Annual motorcycle license fee',
            vehicleCategory: 'MOTORCYCLE',
            price: 3500,
            isMandatory: true,
            validityPeriodDays: 365,
            isLocked: false,
        },
        {
            name: 'Tricycle Permit',
            description: 'Commercial tricycle operating permit',
            vehicleCategory: 'TRICYCLE',
            price: 5500,
            isMandatory: true,
            validityPeriodDays: 365,
            isLocked: false,
        },
    ];

    for (const item of complianceItems) {
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

    console.log('✓ Created compliance items:', complianceItems.length);

    // Create sample agent user
    const agentPasswordHash = await bcrypt.hash('Agent123!', 12);

    const agent = await prisma.user.upsert({
        where: { email: 'agent@motopay.ng' },
        update: {},
        create: {
            email: 'agent@motopay.ng',
            passwordHash: agentPasswordHash,
            fullName: 'John Doe',
            phoneNumber: '+2348023456789',
            role: 'AGENT',
            agentId: 'PM-98234-A',
            isActive: true,
        },
    });

    console.log('✓ Created agent user:', agent.email);

    // Create sample vehicle
    const vehicle = await prisma.vehicle.upsert({
        where: { plateNumber: 'PL-582-KN' },
        update: {},
        create: {
            plateNumber: 'PL-582-KN',
            chassisNumber: '1HGCG2253YA120412',
            engineNumber: 'G4KH-1293842',
            make: 'Toyota',
            model: 'Camry',
            year: 2018,
            vehicleType: 'PRIVATE',
            ownerName: 'Musa Ibrahim Chollom',
            ownerContact: '+2348034567890',
            tin: '1023456789',
            status: 'ACTIVE',
        },
    });

    console.log('✓ Created sample vehicle:', vehicle.plateNumber);

    console.log('🌱 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
