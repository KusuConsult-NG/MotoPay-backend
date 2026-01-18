import prisma from '../config/database';
import { paginate, calculatePagination } from '../utils/helpers';

export class AdminService {
    async getDashboardMetrics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            dailyCollections,
            pendingValidations,
            activeExceptions,
            totalVehicles,
            totalTransactions,
        ] = await Promise.all([
            prisma.transaction.aggregate({
                where: {
                    status: 'SUCCESS',
                    createdAt: { gte: today },
                },
                _sum: { totalAmount: true },
                _count: true,
            }),
            prisma.transaction.count({
                where: { status: 'PENDING' },
            }),
            prisma.exception.count({
                where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
            }),
            prisma.vehicle.count(),
            prisma.transaction.count({ where: { status: 'SUCCESS' } }),
        ]);

        return {
            dailyCollections: {
                amount: Number(dailyCollections._sum.totalAmount || 0),
                count: dailyCollections._count,
            },
            pendingValidations,
            activeExceptions,
            totalVehicles,
            totalTransactions,
        };
    }

    async getTransactions(filters: {
        status?: string;
        channel?: string;
        startDate?: Date;
        endDate?: Date;
        page: number;
        limit: number;
    }) {
        const { status, channel, startDate, endDate, page, limit } = filters;

        const where: any = {};

        if (status) where.status = status;
        if (channel) where.channel = channel;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        const { skip, take } = paginate(page, limit);

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    vehicle: true,
                    user: {
                        select: { id: true, fullName: true, email: true },
                    },
                },
            }),
            prisma.transaction.count({ where }),
        ]);

        return {
            transactions,
            pagination: calculatePagination(total, page, limit),
        };
    }

    async getCollections(startDate: Date, endDate: Date) {
        const transactions = await prisma.transaction.groupBy({
            by: ['createdAt'],
            where: {
                status: 'SUCCESS',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: { totalAmount: true },
            _count: true,
        });

        return transactions.map(t => ({
            ...t,
            _sum: {
                totalAmount: Number(t._sum?.totalAmount || 0)
            }
        }));
    }

    async exportReport(filters: any) {
        // TODO: Implement CSV/PDF export
        const transactions = await this.getTransactions({
            ...filters,
            page: 1,
            limit: 10000, // Large limit for export
        });

        return transactions;
    }
}

export default new AdminService();
