import { Request, Response, NextFunction } from 'express';
import vehicleService from '../services/vehicle.service';
import { ApiResponse } from '../types';

export class VehicleController {
    async lookupVehicle(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.body;
            const vehicle = await vehicleService.lookupVehicle(query);

            const response: ApiResponse = {
                success: true,
                message: 'Vehicle found',
                data: vehicle,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async registerVehicle(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const vehicle = await vehicleService.registerVehicle(data);

            const response: ApiResponse = {
                success: true,
                message: 'Vehicle registered successfully',
                data: vehicle,
            };

            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getVehicle(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const vehicle = await vehicleService.getVehicleById(id);

            const response: ApiResponse = {
                success: true,
                message: 'Vehicle retrieved successfully',
                data: vehicle,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async updateVehicle(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = req.body;
            const vehicle = await vehicleService.updateVehicle(id, data);

            const response: ApiResponse = {
                success: true,
                message: 'Vehicle updated successfully',
                data: vehicle,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async getVehicleCompliance(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const compliance = await vehicleService.getVehicleCompliance(id);

            const response: ApiResponse = {
                success: true,
                message: 'Compliance status retrieved successfully',
                data: compliance,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async getVehicleHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const history = await vehicleService.getVehicleHistory(
                id,
                Number(page),
                Number(limit)
            );

            const response: ApiResponse = {
                success: true,
                message: 'Vehicle history retrieved successfully',
                data: history,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new VehicleController();
