import { Request, Response, NextFunction } from 'express';
import complianceService from '../services/compliance.service';
import { ApiResponse } from '../types';

export class ComplianceController {
    async getComplianceItems(req: Request, res: Response, next: NextFunction) {
        try {
            const { vehicleCategory } = req.query;
            const items = await complianceService.getComplianceItems(vehicleCategory as string | undefined);

            const response: ApiResponse = {
                success: true,
                message: 'Compliance items retrieved successfully',
                data: items,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async getComplianceItem(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const item = await complianceService.getComplianceItemById(id);

            const response: ApiResponse = {
                success: true,
                message: 'Compliance item retrieved successfully',
                data: item,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async checkRequirements(req: Request, res: Response, next: NextFunction) {
        try {
            const { vehicleId } = req.params;
            const requirements = await complianceService.checkComplianceRequirements(vehicleId);

            const response: ApiResponse = {
                success: true,
                message: 'Compliance requirements checked',
                data: requirements,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async updatePrice(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { newPrice, reason } = req.body;
            const changedBy = req.user!.id;

            const item = await complianceService.updateCompliancePrice(id, newPrice, changedBy, reason);

            const response: ApiResponse = {
                success: true,
                message: 'Price updated successfully',
                data: item,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async getPriceHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const history = await complianceService.getPriceHistory(id);

            const response: ApiResponse = {
                success: true,
                message: 'Price history retrieved successfully',
                data: history,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new ComplianceController();
