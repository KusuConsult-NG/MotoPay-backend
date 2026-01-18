import prisma from '../config/database';
import { AppError, validatePlateNumber, validateVIN, validateTIN } from '../utils/helpers';
import { VehicleLookupQuery } from '../types';
import identityService from './identity.service';

export class VehicleService {
    async lookupVehicle(query: VehicleLookupQuery) {
        const { tin, plateNumber, chassisNumber } = query;

        const whereClause: any = {};

        if (tin) {
            if (!validateTIN(tin)) {
                throw new AppError(400, 'Invalid TIN format');
            }
            whereClause.tin = tin;
        } else if (plateNumber) {
            if (!validatePlateNumber(plateNumber)) {
                throw new AppError(400, 'Invalid plate number format');
            }
            whereClause.plateNumber = plateNumber.toUpperCase();
        } else if (chassisNumber) {
            if (!validateVIN(chassisNumber)) {
                throw new AppError(400, 'Invalid chassis number format');
            }
            whereClause.chassisNumber = chassisNumber.toUpperCase();
        } else {
            throw new AppError(400, 'Please provide TIN, plate number, or chassis number');
        }

        const vehicle = await prisma.vehicle.findFirst({
            where: whereClause,
            include: {
                compliance: {
                    include: {
                        complianceItem: true,
                    },
                },
            },
        });

        if (!vehicle) {
            throw new AppError(404, 'Vehicle not found');
        }

        return vehicle;
    }

    async registerVehicle(data: any) {
        // Check if vehicle already exists
        const existing = await prisma.vehicle.findFirst({
            where: {
                OR: [
                    { plateNumber: data.plateNumber.toUpperCase() },
                    { chassisNumber: data.chassisNumber.toUpperCase() },
                ],
            },
        });

        if (existing) {
            throw new AppError(409, 'Vehicle with this plate number or chassis number already exists');
        }

        // Verify TIN if provided
        let tinVerified = false;
        if (data.tin) {
            const verification = await identityService.verifyTIN(data.tin);
            if (!verification.success) {
                throw new AppError(400, verification.error || 'TIN verification failed');
            }
            tinVerified = true;
        }

        const vehicle = await prisma.vehicle.create({
            data: {
                ...data,
                plateNumber: data.plateNumber.toUpperCase(),
                chassisNumber: data.chassisNumber.toUpperCase(),
                tinVerified,
            },
        });

        return vehicle;
    }

    async getVehicleById(id: string) {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: {
                compliance: {
                    include: {
                        complianceItem: true,
                    },
                },
            },
        });

        if (!vehicle) {
            throw new AppError(404, 'Vehicle not found');
        }

        return vehicle;
    }

    async updateVehicle(id: string, data: any) {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
        });

        if (!vehicle) {
            throw new AppError(404, 'Vehicle not found');
        }

        const updated = await prisma.vehicle.update({
            where: { id },
            data,
        });

        return updated;
    }

    async getVehicleCompliance(id: string) {
        const vehicle = await this.getVehicleById(id);

        const compliance = await prisma.vehicleCompliance.findMany({
            where: { vehicleId: id },
            include: {
                complianceItem: true,
            },
            orderBy: {
                expiryDate: 'desc',
            },
        });

        // Categorize compliance status
        const now = new Date();
        const active = compliance.filter((c: any) => c.expiryDate > now && c.status === 'ACTIVE');
        const expired = compliance.filter((c: any) => c.expiryDate <= now || c.status === 'EXPIRED');
        const pending = compliance.filter((c: any) => c.status === 'PENDING');

        return {
            vehicle: {
                id: vehicle.id,
                plateNumber: vehicle.plateNumber,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
            },
            compliance: {
                active,
                expired,
                pending,
            },
            summary: {
                totalItems: compliance.length,
                activeCount: active.length,
                expiredCount: expired.length,
                pendingCount: pending.length,
            },
        };
    }

    async getVehicleHistory(id: string, page: number = 1, limit: number = 10) {
        const vehicle = await this.getVehicleById(id);

        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: { vehicleId: id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    receipt: true,
                },
            }),
            prisma.transaction.count({
                where: { vehicleId: id },
            }),
        ]);

        return {
            vehicle: {
                id: vehicle.id,
                plateNumber: vehicle.plateNumber,
            },
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}

export default new VehicleService();
