import prisma from '../config/database';

export class SearchService {
    async globalSearch(query: string, filters?: {
        type?: 'vehicle' | 'transaction' | 'user';
        limit?: number;
    }) {
        const limit = filters?.limit || 10;
        const results: any = {};

        if (!filters?.type || filters.type === 'vehicle') {
            results.vehicles = await prisma.vehicle.findMany({
                where: {
                    OR: [
                        { plateNumber: { contains: query, mode: 'insensitive' } },
                        { chassisNumber: { contains: query, mode: 'insensitive' } },
                        { ownerName: { contains: query, mode: 'insensitive' } },
                        { tin: { contains: query } },
                    ],
                },
                take: limit,
            });
        }

        if (!filters?.type || filters.type === 'transaction') {
            results.transactions = await prisma.transaction.findMany({
                where: {
                    reference: { contains: query, mode: 'insensitive' },
                },
                include: {
                    vehicle: true,
                },
                take: limit,
            });
        }

        if (!filters?.type || filters.type === 'user') {
            results.users = await prisma.user.findMany({
                where: {
                    OR: [
                        { email: { contains: query, mode: 'insensitive' } },
                        { fullName: { contains: query, mode: 'insensitive' } },
                        { agentId: { contains: query, mode: 'insensitive' } },
                    ],
                },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
                    agentId: true,
                },
                take: limit,
            });
        }

        return results;
    }

    async advancedVehicleFilter(filters: {
        vehicleType?: string;
        make?: string;
        yearFrom?: number;
        yearTo?: number;
        status?: string;
        hasExpiredCompliance?: boolean;
    }) {
        const where: any = {};

        if (filters.vehicleType) where.vehicleType = filters.vehicleType;
        if (filters.make) where.make = { contains: filters.make, mode: 'insensitive' };
        if (filters.status) where.status = filters.status;

        if (filters.yearFrom || filters.yearTo) {
            where.year = {};
            if (filters.yearFrom) where.year.gte = filters.yearFrom;
            if (filters.yearTo) where.year.lte = filters.yearTo;
        }

        const vehicles = await prisma.vehicle.findMany({
            where,
            include: {
                compliance: {
                    include: {
                        complianceItem: true,
                    },
                },
            },
        });

        if (filters.hasExpiredCompliance !== undefined) {
            const now = new Date();
            return vehicles.filter((v: any) => {
                const hasExpired = v.compliance.some(
                    (c: any) => new Date(c.expiryDate) < now
                );
                return filters.hasExpiredCompliance ? hasExpired : !hasExpired;
            });
        }

        return vehicles;
    }
}

export default new SearchService();
