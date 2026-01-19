import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedContentData() {
    console.log('🌱 Seeding content data...');

    // Seed Services
    const services = [
        {
            icon: 'description',
            title: 'Vehicle Registration',
            description: 'Quick and easy vehicle registration for private, commercial, and motorcycle vehicles.',
            features: ['Online application', 'Document verification', 'Instant receipt'],
            order: 1,
        },
        {
            icon: 'credit_card',
            title: 'License Renewal',
            description: 'Renew your vehicle license online with instant payment processing.',
            features: ['Multiple payment options', 'SMS confirmation', 'Digital receipts'],
            order: 2,
        },
        {
            icon: 'verified',
            title: 'Compliance Check',
            description: 'Verify your vehicle compliance status and required documents.',
            features: ['Real-time verification', 'Compliance dashboard', 'Document tracking'],
            order: 3,
        },
        {
            icon: 'local_shipping',
            title: 'Commercial Permits',
            description: 'Apply for and manage commercial vehicle permits and badges.',
            features: ['Hackney permits', "Driver's badges", 'Fleet management'],
            order: 4,
        },
        {
            icon: 'receipt_long',
            title: 'Transaction History',
            description: 'Access your complete payment and renewal history anytime.',
            features: ['Detailed records', 'Export to PDF', 'Email receipts'],
            order: 5,
        },
        {
            icon: 'support_agent',
            title: 'Agent Services',
            description: 'Authorized agents can assist with registrations and renewals.',
            features: ['Commission tracking', 'Bulk renewals', 'Customer support'],
            order: 6,
        },
    ];

    for (const service of services) {
        await prisma.service.upsert({
            where: { id: service.title.replace(/\s+/g, '-').toLowerCase() },
            update: {
                ...service,
                features: JSON.stringify(service.features),
            },
            create: {
                ...service,
                features: JSON.stringify(service.features),
            },
        });
    }
    console.log(`✓ Created ${services.length} services`);

    // Seed About Sections
    const aboutSections = [
        {
            section: 'mission',
            title: 'Our Mission',
            content: 'MotoPay is the official digital platform for the Plateau State Internal Revenue Service (PSIRS) designed to simplify vehicle licensing, renewals, and compliance management. We are committed to providing efficient, transparent, and accessible services to all vehicle owners in Plateau State.',
            order: 1,
        },
        {
            section: 'what-we-do',
            title: 'What We Do',
            content: '',
            items: [
                'Process vehicle registrations and license renewals online',
                'Verify vehicle compliance with state regulations',
                'Manage commercial vehicle permits and badges',
                'Provide secure payment processing through Paystack',
                'Support authorized agents with commission tracking',
            ],
            order: 2,
        },
        {
            section: 'why-choose',
            title: 'Why Choose MotoPay?',
            content: '',
            items: [
                { icon: 'speed', title: 'Fast & Efficient', description: 'Complete renewals in minutes, not hours' },
                { icon: 'security', title: 'Secure Payments', description: 'Bank-grade encryption for all transactions' },
                { icon: 'phone_android', title: 'Mobile Friendly', description: 'Access from any device, anywhere' },
                { icon: 'support_agent', title: '24/7 Support', description: 'We\'re here to help when you need us' },
            ],
            order: 3,
        },
    ];

    for (const section of aboutSections) {
        await prisma.aboutSection.upsert({
            where: { id: section.section },
            update: {
                ...section,
                items: section.items ? JSON.stringify(section.items) : null,
            },
            create: {
                ...section,
                items: section.items ? JSON.stringify(section.items) : null,
            },
        });
    }
    console.log(`✓ Created ${aboutSections.length} about sections`);

    // Seed FAQs
    const faqs = [
        {
            category: 'general',
            question: 'How do I renew my vehicle license?',
            answer: 'Start by entering your vehicle plate number on the lookup page. Verify your details, select renewal options, and proceed to payment. You will receive your receipt via email and SMS.',
            order: 1,
        },
        {
            category: 'payments',
            question: 'What payment methods are accepted?',
            answer: 'We accept all major debit and credit cards through our secure Paystack payment gateway. You can also pay using bank transfers and USSD.',
            order: 2,
        },
        {
            category: 'general',
            question: 'How long does processing take?',
            answer: 'Most renewals are processed instantly after payment confirmation. Your receipt and license documents are sent to your email immediately upon successful payment.',
            order: 3,
        },
        {
            category: 'registration',
            question: 'What documents do I need?',
            answer: 'For renewals, you typically need your vehicle registration, proof of ownership, road worthiness certificate, and insurance. Commercial vehicles may require additional permits.',
            order: 4,
        },
        {
            category: 'general',
            question: 'Can I renew for multiple vehicles?',
            answer: 'Yes! You can renew multiple vehicles by completing the process for each vehicle separately. Authorized agents can also handle bulk renewals.',
            order: 5,
        },
        {
            category: 'compliance',
            question: 'How do I become an agent?',
            answer: 'Contact PSIRS at agent@motopay.ng with your application. Approved agents receive login credentials and can track commissions through the agent portal.',
            order: 6,
        },
        {
            category: 'general',
            question: 'What if my vehicle information is wrong?',
            answer: 'If you notice incorrect vehicle information, please contact our support team immediately. Exceptions can be raised through the admin panel for resolution.',
            order: 7,
        },
        {
            category: 'payments',
            question: 'How do I get a receipt?',
            answer: 'Receipts are automatically sent to your email and phone number after successful payment. You can also access and download receipts from your transaction history.',
            order: 8,
        },
    ];

    for (const faq of faqs) {
        await prisma.fAQ.create({
            data: faq,
        });
    }
    console.log(`✓ Created ${faqs.length} FAQs`);

    // Seed Help Categories
    const helpCategories = [
        {
            icon: 'directions_car',
            title: 'Vehicle Registration',
            link: '/lookup',
            description: 'Learn about registering new and used vehicles',
            order: 1,
        },
        {
            icon: 'payment',
            title: 'Payments & Fees',
            link: '/services',
            description: 'Understanding fees, charges, and payment options',
            order: 2,
        },
        {
            icon: 'verified',
            title: 'Compliance',
            link: '/commercial',
            description: 'Requirements for commercial and private vehicles',
            order: 3,
        },
        {
            icon: 'support_agent',
            title: 'Agent Support',
            link: '/login',
            description: 'Resources for authorized agents',
            order: 4,
        },
    ];

    for (const category of helpCategories) {
        await prisma.helpCategory.create({
            data: category,
        });
    }
    console.log(`✓ Created ${helpCategories.length} help categories`);

    console.log('✅ Content data seeded successfully!');
}

// Run if called directly
if (require.main === module) {
    seedContentData()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
