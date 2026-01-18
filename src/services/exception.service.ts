import prisma from '../config/database';
import { AppError, generateTicketNumber, paginate, calculatePagination } from '../utils/helpers';

export class ExceptionService {
    async createException(data: {
        type: string;
        userSubmittedData: any;
        plateNumber?: string;
        chassisNumber?: string;
        evidenceUrls?: string[];
    }) {
        const ticketNumber = generateTicketNumber();

        const exception = await prisma.exception.create({
            data: {
                ticketNumber,
                type: data.type as any,
                userSubmittedData: data.userSubmittedData,
                plateNumber: data.plateNumber?.toUpperCase(),
                chassisNumber: data.chassisNumber?.toUpperCase(),
                status: 'PENDING',
                evidenceUrls: data.evidenceUrls || [],
            },
        });

        return exception;
    }

    async getExceptions(filters: {
        status?: string;
        assignedTo?: string;
        page: number;
        limit: number;
    }) {
        const { status, assignedTo, page, limit } = filters;

        const where: any = {};
        if (status) where.status = status;
        if (assignedTo) where.assignedTo = assignedTo;

        const { skip, take } = paginate(page, limit);

        const [exceptions, total] = await Promise.all([
            prisma.exception.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    assignedUser: {
                        select: { id: true, fullName: true, email: true },
                    },
                },
            }),
            prisma.exception.count({ where }),
        ]);

        return {
            exceptions,
            pagination: calculatePagination(total, page, limit),
        };
    }

    async getExceptionById(id: string) {
        const exception = await prisma.exception.findUnique({
            where: { id },
            include: {
                assignedUser: {
                    select: { id: true, fullName: true, email: true },
                },
            },
        });

        if (!exception) {
            throw new AppError(404, 'Exception not found');
        }

        return exception;
    }

    async assignException(id: string, assignedTo: string) {
        const exception = await this.getExceptionById(id);

        const updated = await prisma.exception.update({
            where: { id },
            data: {
                assignedTo,
                status: 'IN_PROGRESS',
            },
        });

        return updated;
    }

    async updateExceptionStatus(id: string, status: string) {
        const exception = await this.getExceptionById(id);

        const updated = await prisma.exception.update({
            where: { id },
            data: { status: status as any },
        });

        return updated;
    }

    async resolveException(id: string, resolutionNotes: string) {
        const exception = await this.getExceptionById(id);

        const updated = await prisma.exception.update({
            where: { id },
            data: {
                status: 'RESOLVED',
                resolutionNotes,
                resolvedAt: new Date(),
            },
        });

        return updated;
    }
}

export default new ExceptionService();
