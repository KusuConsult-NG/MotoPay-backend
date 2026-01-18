import { Request, Response, NextFunction } from 'express';
import searchService from '../services/search.service';
import { ApiResponse } from '../types';

export class SearchController {
    async globalSearch(req: Request, res: Response, next: NextFunction) {
        try {
            const { q, type, limit } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required',
                });
            }

            const results = await searchService.globalSearch(q as string, {
                type: type as any,
                limit: limit ? parseInt(limit as string) : undefined,
            });

            const response: ApiResponse = {
                success: true,
                message: 'Search completed',
                data: results,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async advancedFilter(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = req.query;

            const results = await searchService.advancedVehicleFilter({
                vehicleType: filters.vehicleType as string | undefined,
                make: filters.make as string | undefined,
                yearFrom: filters.yearFrom ? parseInt(filters.yearFrom as string) : undefined,
                yearTo: filters.yearTo ? parseInt(filters.yearTo as string) : undefined,
                status: filters.status as string | undefined,
                hasExpiredCompliance: filters.hasExpiredCompliance === 'true',
            });

            const response: ApiResponse = {
                success: true,
                message: 'Filter applied successfully',
                data: results,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }
}

export default new SearchController();
