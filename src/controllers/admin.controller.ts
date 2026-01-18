import { Request, Response, NextFunction } from 'express';
import adminService from '../services/admin.service';
import { ApiResponse } from '../types';

export class AdminController {
    async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
        try {
            const metrics = await adminService.getDashboardMetrics();

            const response: ApiResponse = {
                success: true,
                message: 'Dashboard metrics retrieved successfully',
                data: metrics,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async getTransactions(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                status,
                channel,
                startDate,
                endDate,
                page = '1',
                limit = '20',
            } = req.query;

            const result = await adminService.getTransactions({
                status: status as string | undefined,
                channel: channel as string | undefined,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
            });

            const response: ApiResponse = {
                success: true,
                message: 'Transactions retrieved successfully',
                data: result,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async getCollections(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date and end date are required',
                });
            }

            const collections = await adminService.getCollections(
                new Date(startDate as string),
                new Date(endDate as string)
            );

            const response: ApiResponse = {
                success: true,
                message: 'Collections retrieved successfully',
                data: collections,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async exportReport(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = req.query;
            const data = await adminService.exportReport(filters);

            const response: ApiResponse = {
                success: true,
                message: 'Report exported successfully',
                data,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();
