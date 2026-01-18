import prisma from '../config/database';
import { AppError } from '../utils/helpers';

export class ComplianceService {
    async getComplianceItems(vehicleCategory?: string) {
        const where = vehicleCategory ? { vehicleCategory: vehicleCategory as any } : {};

        const items = await prisma.complianceItem.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        return items;
    }

    async getComplianceItemById(id: string) {
        const item = await prisma.complianceItem.findUnique({
            where: { id },
        });

        if (!item) {
            throw new AppError(404, 'Compliance item not found');
        }

        return item;
    }

    async checkComplianceRequirements(vehicleId: string) {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });

        if (!vehicle) {
            throw new AppError(404, 'Vehicle not found');
        }

        // Get all compliance items for this vehicle category
        const requiredItems = await prisma.complianceItem.findMany({
            where: { vehicleCategory: vehicle.vehicleType },
        });

        // Get existing compliance records
        const existingCompliance = await prisma.vehicleCompliance.findMany({
            where: { vehicleId },
            include: { complianceItem: true },
        });

        // Categorize items
        const now = new Date();
        const mandatory = requiredItems.filter((item: any) => item.isMandatory);
        const optional = requiredItems.filter((item: any) => !item.isMandatory);

        const active = existingCompliance.filter(
            (c: any) => c.status === 'ACTIVE' && c.expiryDate > now
        );

        const expired = existingCompliance.filter(
            (c: any) => c.status === 'EXPIRED' || c.expiryDate <= now
        );

        const missingMandatory = mandatory.filter(
            (item: any) => !existingCompliance.some((c: any) => c.complianceItemId === item.id)
        );

        return {
            vehicle,
            requiredItems: {
                mandatory,
                optional,
            },
            currentCompliance: {
                active,
                expired,
            },
            missingMandatory,
            isCompliant: missingMandatory.length === 0 && expired.length === 0,
        };
    }

    async updateCompliancePrice(id: string, newPrice: number, changedBy: string, reason: string) {
        const item = await this.getComplianceItemById(id);

        if (item.isLocked) {
            throw new AppError(403, 'This compliance item price is locked and requires executive approval');
        }

        // Record price change in history
        await prisma.priceHistory.create({
            data: {
                complianceItemId: id,
                oldPrice: item.price,
                newPrice,
                changedBy,
                reason,
            },
        });

        // Update price
        const updated = await prisma.complianceItem.update({
            where: { id },
            data: { price: newPrice },
        });

        return updated;
    }

    async getPriceHistory(complianceItemId: string) {
        const history = await prisma.priceHistory.findMany({
            where: { complianceItemId },
            orderBy: { createdAt: 'desc' },
            include: {
                changer: {
                    select: { id: true, fullName: true, email: true },
                },
                approver: {
                    select: { id: true, fullName: true, email: true },
                },
            },
        });

        return history;
    }
}

export default new ComplianceService();
