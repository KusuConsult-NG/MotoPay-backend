import { Request, Response, NextFunction } from 'express';
import paymentService from '../services/payment.service';
import { ApiResponse } from '../types';

export class PaymentController {
    async initializePayment(req: Request, res: Response, next: NextFunction) {
        try {
            const data = {
                ...req.body,
                userId: req.user?.id,
                agentId: req.user?.role === 'AGENT' ? req.user.id : undefined,
            };

            const result = await paymentService.initializePayment(data);

            const response: ApiResponse = {
                success: true,
                message: 'Payment initialized successfully',
                data: result,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async verifyPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const { reference } = req.params;
            const result = await paymentService.verifyPayment(reference);

            const response: ApiResponse = {
                success: true,
                message: result.message,
                data: result.transaction,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async handleWebhook(req: Request, res: Response, next: NextFunction) {
        try {
            const signature = req.headers['x-paystack-signature'] as string;

            if (!signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing signature',
                });
            }

            const result = await paymentService.handleWebhook(req.body, signature);

            return res.json(result);
        } catch (error) {
            return next(error);
        }
    }

    async getTransaction(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const transaction = await paymentService.getTransactionById(id);

            const response: ApiResponse = {
                success: true,
                message: 'Transaction retrieved successfully',
                data: transaction,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async processRefund(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const transaction = await paymentService.processRefund(id, reason);

            const response: ApiResponse = {
                success: true,
                message: 'Refund processed successfully',
                data: transaction,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }
}

export default new PaymentController();
