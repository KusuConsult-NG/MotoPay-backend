import { Request, Response, NextFunction } from 'express';
import agentService from '../services/agent.service';
import exportService from '../services/export.service';
import { ApiResponse } from '../types';

export class AgentController {
    async registerAgent(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const agent = await agentService.registerAgent(data);

            const response: ApiResponse = {
                success: true,
                message: 'Agent registered successfully',
                data: agent,
            };

            return res.status(201).json(response);
        } catch (error) {
            return next(error);
        }
    }

    async getMyCommissions(req: Request, res: Response, next: NextFunction) {
        try {
            const agentId = req.user!.id;
            const { page = '1', limit = '20' } = req.query;

            const result = await agentService.getAgentCommissions(
                agentId,
                parseInt(page as string),
                parseInt(limit as string)
            );

            const response: ApiResponse = {
                success: true,
                message: 'Commissions retrieved successfully',
                data: result,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async getMyTransactions(req: Request, res: Response, next: NextFunction) {
        try {
            const agentId = req.user!.id;
            const { page = '1', limit = '20' } = req.query;

            const result = await agentService.getAgentTransactions(
                agentId,
                parseInt(page as string),
                parseInt(limit as string)
            );

            const response: ApiResponse = {
                success: true,
                message: 'Transactions retrieved successfully',
                data: result,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async getMySummary(req: Request, res: Response, next: NextFunction) {
        try {
            const agentId = req.user!.id;
            const summary = await agentService.getAgentSummary(agentId);

            const response: ApiResponse = {
                success: true,
                message: 'Agent summary retrieved successfully',
                data: summary,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async processAssistedRenewal(req: Request, res: Response, next: NextFunction) {
        try {
            const agentId = req.user!.id;
            const data = { ...req.body, agentId };

            const result = await agentService.processAssistedRenewal(data);

            const response: ApiResponse = {
                success: true,
                message: 'Assisted renewal initiated',
                data: result,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async exportCommissions(req: Request, res: Response, next: NextFunction) {
        try {
            const agentId = req.user!.id;
            const { startDate, endDate } = req.query;

            const csv = await exportService.exportAgentCommissionsCSV(
                agentId,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=commissions-${Date.now()}.csv`);
            return res.send(csv);
        } catch (error) {
            return next(error);
        }
    }
}

export default new AgentController();
