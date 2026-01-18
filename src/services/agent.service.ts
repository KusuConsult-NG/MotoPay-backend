import prisma from '../config/database';
import { AppError, paginate, calculatePagination } from '../utils/helpers';

export class AgentService {
    async registerAgent(data: {
        userId: string;
        agentId: string;
        verificationDocuments?: string[];
    }) {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: data.userId },
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        if (user.role !== 'PUBLIC') {
            throw new AppError(400, 'User already has a role assigned');
        }

        // Check if agent ID is already taken
        const existingAgent = await prisma.user.findUnique({
            where: { agentId: data.agentId },
        });

        if (existingAgent) {
            throw new AppError(409, 'Agent ID already in use');
        }

        // Update user to agent
        const agent = await prisma.user.update({
            where: { id: data.userId },
            data: {
                role: 'AGENT',
                agentId: data.agentId,
            },
        });

        return agent;
    }

    async getAgentCommissions(agentId: string, page: number = 1, limit: number = 20) {
        const { skip, take } = paginate(page, limit);

        const [commissions, total] = await Promise.all([
            prisma.agentCommission.findMany({
                where: { agentId },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    transaction: {
                        include: {
                            vehicle: true,
                        },
                    },
                },
            }),
            prisma.agentCommission.count({
                where: { agentId },
            }),
        ]);

        return {
            commissions,
            pagination: calculatePagination(total, page, limit),
        };
    }

    async getAgentTransactions(agentId: string, page: number = 1, limit: number = 20) {
        const { skip, take } = paginate(page, limit);

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: { agentId },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    vehicle: true,
                    receipt: true,
                },
            }),
            prisma.transaction.count({
                where: { agentId },
            }),
        ]);

        return {
            transactions,
            pagination: calculatePagination(total, page, limit),
        };
    }

    async getAgentSummary(agentId: string) {
        const [totalCommissions, pendingCommissions, paidCommissions, totalTransactions] = await Promise.all([
            prisma.agentCommission.aggregate({
                where: { agentId },
                _sum: { amount: true },
                _count: true,
            }),
            prisma.agentCommission.aggregate({
                where: { agentId, status: 'PENDING' },
                _sum: { amount: true },
                _count: true,
            }),
            prisma.agentCommission.aggregate({
                where: { agentId, status: 'PAID' },
                _sum: { amount: true },
                _count: true,
            }),
            prisma.transaction.count({
                where: { agentId, status: 'SUCCESS' },
            }),
        ]);

        return {
            totalEarnings: totalCommissions._sum.amount || 0,
            pendingCommissions: {
                amount: pendingCommissions._sum.amount || 0,
                count: pendingCommissions._count,
            },
            paidCommissions: {
                amount: paidCommissions._sum.amount || 0,
                count: paidCommissions._count,
            },
            totalTransactions,
            totalCommissionRecords: totalCommissions._count,
        };
    }

    async processAssistedRenewal(data: {
        agentId: string;
        vehicleId: string;
        complianceItems: string[];
        email: string;
    }) {
        // This would use the payment service
        // For now, return structure
        return {
            success: true,
            message: 'Assisted renewal initiated',
            agentId: data.agentId,
            vehicleId: data.vehicleId,
        };
    }
}

export default new AgentService();
