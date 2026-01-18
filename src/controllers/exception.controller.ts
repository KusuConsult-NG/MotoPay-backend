import { Request, Response, NextFunction } from 'express';
import exceptionService from '../services/exception.service';
import { ApiResponse } from '../types';

export class ExceptionController {
    async createException(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const exception = await exceptionService.createException(data);

            const response: ApiResponse = {
                success: true,
                message: 'Exception created successfully',
                data: exception,
            };

            return res.status(201).json(response);
        } catch (error) {
            return next(error);
        }
    }

    async getExceptions(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, assignedTo, page = '1', limit = '20' } = req.query;

            const result = await exceptionService.getExceptions({
                status: status as string | undefined,
                assignedTo: assignedTo as string | undefined,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
            });

            const response: ApiResponse = {
                success: true,
                message: 'Exceptions retrieved successfully',
                data: result,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async getException(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const exception = await exceptionService.getExceptionById(id);

            const response: ApiResponse = {
                success: true,
                message: 'Exception retrieved successfully',
                data: exception,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async assignException(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { assignedTo } = req.body;

            const exception = await exceptionService.assignException(id, assignedTo);

            const response: ApiResponse = {
                success: true,
                message: 'Exception assigned successfully',
                data: exception,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const exception = await exceptionService.updateExceptionStatus(id, status);

            const response: ApiResponse = {
                success: true,
                message: 'Exception status updated',
                data: exception,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async resolveException(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { resolutionNotes } = req.body;

            const exception = await exceptionService.resolveException(id, resolutionNotes);

            const response: ApiResponse = {
                success: true,
                message: 'Exception resolved successfully',
                data: exception,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async bulkAssign(req: Request, res: Response, next: NextFunction) {
        try {
            const { exceptionIds, assignedTo } = req.body;

            const results = await Promise.all(
                exceptionIds.map((id: string) => exceptionService.assignException(id, assignedTo))
            );

            const response: ApiResponse = {
                success: true,
                message: `${results.length} exceptions assigned successfully`,
                data: { count: results.length },
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }
}

export default new ExceptionController();
