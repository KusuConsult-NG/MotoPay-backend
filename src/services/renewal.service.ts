import prisma from '../config/database';
import { addDays } from '../utils/helpers';
import emailService from './email.service';
import smsService from './sms.service';
import logger from '../config/logger';

export class ComplianceRenewalService {
    /**
     * Process automatic compliance renewal
     */
    async processRenewal(vehicleId: string, complianceItemIds: string[]): Promise<any> {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });

        if (!vehicle) {
            throw new Error('Vehicle not found');
        }

        const renewalResults = [];

        for (const itemId of complianceItemIds) {
            const complianceItem = await prisma.complianceItem.findUnique({
                where: { id: itemId },
            });

            if (!complianceItem) {
                continue;
            }

            // Check if there's an existing compliance record
            const existing = await prisma.vehicleCompliance.findFirst({
                where: {
                    vehicleId,
                    complianceItemId: itemId,
                },
                orderBy: {
                    expiryDate: 'desc',
                },
            });

            const now = new Date();
            let newExpiryDate: Date;

            if (existing && existing.expiryDate > now) {
                // Extend from current expiry date
                newExpiryDate = addDays(existing.expiryDate, complianceItem.validityPeriodDays);
            } else {
                // Start from today
                newExpiryDate = addDays(now, complianceItem.validityPeriodDays);
            }

            // Create new compliance record
            await prisma.vehicleCompliance.create({
                data: {
                    vehicleId,
                    complianceItemId: itemId,
                    status: 'ACTIVE',
                    issueDate: now,
                    expiryDate: newExpiryDate,
                },
            });

            // Mark old one as expired if exists
            if (existing) {
                await prisma.vehicleCompliance.update({
                    where: { id: existing.id },
                    data: { status: 'EXPIRED' },
                });
            }

            renewalResults.push({
                complianceItem: complianceItem.name,
                expiryDate: newExpiryDate,
                renewed: true,
            });
        }

        // Update vehicle last renewal date
        await prisma.vehicle.update({
            where: { id: vehicleId },
            data: { lastRenewalDate: new Date() },
        });

        return {
            vehicle: vehicle.plateNumber,
            renewedItems: renewalResults,
        };
    }

    /**
     * Check and process upcoming expirations
     */
    async checkUpcomingExpirations() {
        const now = new Date();
        const thirtyDaysLater = addDays(now, 30);

        const expiring = await prisma.vehicleCompliance.findMany({
            where: {
                expiryDate: {
                    gte: now,
                    lte: thirtyDaysLater,
                },
                status: 'ACTIVE',
            },
            include: {
                vehicle: true,
                complianceItem: true,
            },
        });

        logger.info(`Found ${expiring.length} compliance items expiring soon`);

        for (const item of expiring) {
            const daysRemaining = Math.ceil(
                (new Date(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Send reminders at specific intervals
            if ([30, 14, 7, 1].includes(daysRemaining)) {
                try {
                    await emailService.sendRenewalReminder(item.vehicle.ownerContact, {
                        vehiclePlate: item.vehicle.plateNumber,
                        complianceItem: item.complianceItem.name,
                        expiryDate: new Date(item.expiryDate).toLocaleDateString(),
                        daysRemaining,
                    });

                    await smsService.sendRenewalReminder(
                        item.vehicle.ownerContact,
                        item.vehicle.plateNumber,
                        daysRemaining
                    );

                    logger.info(`Sent renewal reminder for ${item.vehicle.plateNumber} - ${daysRemaining} days`);
                } catch (error) {
                    logger.error(`Failed to send reminder for ${item.vehicle.plateNumber}:`, error);
                }
            }
        }

        return { processed: expiring.length };
    }

    /**
     * Auto-expire compliance items that have passed their expiry date
     */
    async expireComplianceItems() {
        const now = new Date();

        const updated = await prisma.vehicleCompliance.updateMany({
            where: {
                expiryDate: {
                    lt: now,
                },
                status: 'ACTIVE',
            },
            data: {
                status: 'EXPIRED',
            },
        });

        logger.info(`Expired ${updated.count} compliance items`);
        return { expiredCount: updated.count };
    }

    /**
     * Get renewal recommendations for a vehicle
     */
    async getRenewalRecommendations(vehicleId: string) {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
            include: {
                compliance: {
                    include: {
                        complianceItem: true,
                    },
                },
            },
        });

        if (!vehicle) {
            throw new Error('Vehicle not found');
        }

        const now = new Date();
        const recommendations = [];

        // Get all mandatory items for this vehicle type
        const mandatoryItems = await prisma.complianceItem.findMany({
            where: {
                vehicleCategory: vehicle.vehicleType,
                isMandatory: true,
            },
        });

        for (const item of mandatoryItems) {
            const existing = vehicle.compliance.find((c: any) => c.complianceItemId === item.id);

            if (!existing || existing.expiryDate < now || existing.status === 'EXPIRED') {
                recommendations.push({
                    complianceItem: item.name,
                    price: Number(item.price),
                    status: 'REQUIRED',
                    reason: !existing ? 'Not registered' : 'Expired',
                });
            } else {
                const daysToExpiry = Math.ceil(
                    (new Date(existing.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (daysToExpiry <= 30) {
                    recommendations.push({
                        complianceItem: item.name,
                        price: Number(item.price),
                        status: 'EXPIRING_SOON',
                        daysRemaining: daysToExpiry,
                    });
                }
            }
        }

        return recommendations;
    }
}

export default new ComplianceRenewalService();
