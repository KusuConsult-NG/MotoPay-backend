import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config';
import prisma from '../config/database';
import { AppError, generateReference, calculateFee, addDays } from '../utils/helpers';
import logger from '../config/logger';

export class PaymentService {
    async initializePayment(data: {
        vehicleId: string;
        complianceItems: string[];
        email: string;
        userId?: string;
        agentId?: string;
    }) {
        // Get vehicle
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: data.vehicleId },
        });

        if (!vehicle) {
            throw new AppError(404, 'Vehicle not found');
        }

        // Get compliance items and calculate total
        const items = await prisma.complianceItem.findMany({
            where: { id: { in: data.complianceItems } },
        });

        if (items.length !== data.complianceItems.length) {
            throw new AppError(400, 'Some compliance items not found');
        }

        const amount = items.reduce((sum, item) => sum + Number(item.price), 0);
        const fee = calculateFee(amount);
        const totalAmount = amount + fee;

        // Create transaction
        const reference = generateReference('TXN');

        const transaction = await prisma.transaction.create({
            data: {
                reference,
                userId: data.userId,
                vehicleId: data.vehicleId,
                amount,
                fee,
                totalAmount,
                paymentMethod: 'CARD',
                paymentGateway: 'PAYSTACK',
                status: 'PENDING',
                channel: data.agentId ? 'AGENT' : 'SELF',
                agentId: data.agentId,
                metadata: {
                    complianceItems: items.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: Number(item.price),
                    })),
                },
            },
        });

        // Initialize payment with Paystack
        try {
            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email: data.email,
                    amount: Math.round(totalAmount * 100), // Convert to kobo
                    reference,
                    callback_url: `${config.frontend.url}/payment/callback`,
                    metadata: {
                        transactionId: transaction.id,
                        vehicleId: vehicle.id,
                        plateNumber: vehicle.plateNumber,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${config.paystack.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return {
                transactionId: transaction.id,
                reference,
                authorizationUrl: response.data.data.authorization_url,
                accessCode: response.data.data.access_code,
            };
        } catch (error: any) {
            logger.error('Paystack initialization error:', error.response?.data || error.message);
            throw new AppError(500, 'Payment initialization failed');
        }
    }

    async verifyPayment(reference: string) {
        // Get transaction
        const transaction = await prisma.transaction.findUnique({
            where: { reference },
            include: {
                vehicle: true,
            },
        });

        if (!transaction) {
            throw new AppError(404, 'Transaction not found');
        }

        if (transaction.status === 'SUCCESS') {
            return { transaction, message: 'Transaction already verified' };
        }

        // Verify with Paystack
        try {
            const response = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${config.paystack.secretKey}`,
                    },
                }
            );

            const { status, amount, paid_at, gateway_response } = response.data.data;

            if (status === 'success' && amount === Math.round(transaction.totalAmount * 100)) {
                // Update transaction
                const updated = await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'SUCCESS',
                        paymentReference: reference,
                        metadata: {
                            ...(transaction.metadata as any),
                            paidAt: paid_at,
                            gatewayResponse: gateway_response,
                        },
                    },
                    include: {
                        vehicle: true,
                    },
                });

                // Update vehicle compliance
                const complianceItems = (transaction.metadata as any).complianceItems;
                const now = new Date();

                for (const item of complianceItems) {
                    const complianceItem = await prisma.complianceItem.findUnique({
                        where: { id: item.id },
                    });

                    if (complianceItem) {
                        await prisma.vehicleCompliance.create({
                            data: {
                                vehicleId: transaction.vehicleId,
                                complianceItemId: item.id,
                                status: 'ACTIVE',
                                issueDate: now,
                                expiryDate: addDays(now, complianceItem.validityPeriodDays),
                            },
                        });
                    }
                }

                // Update vehicle last renewal date
                await prisma.vehicle.update({
                    where: { id: transaction.vehicleId },
                    data: { lastRenewalDate: now },
                });

                // Create receipt
                await this.createReceipt(updated.id);

                // Calculate agent commission if applicable
                if (updated.agentId) {
                    await this.calculateAgentCommission(updated.id, updated.agentId, updated.amount);
                }

                return { transaction: updated, message: 'Payment verified successfully' };
            } else {
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'FAILED' },
                });

                throw new AppError(400, 'Payment verification failed');
            }
        } catch (error: any) {
            logger.error('Payment verification error:', error.response?.data || error.message);

            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError(500, 'Payment verification failed');
        }
    }

    async handleWebhook(payload: any, signature: string) {
        // Verify webhook signature
        const hash = crypto
            .createHmac('sha512', config.paystack.secretKey)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (hash !== signature) {
            throw new AppError(401, 'Invalid webhook signature');
        }

        const { event, data } = payload;

        if (event === 'charge.success') {
            await this.verifyPayment(data.reference);
        }

        return { message: 'Webhook processed' };
    }

    private async createReceipt(transactionId: string) {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                vehicle: true,
                user: true,
            },
        });

        if (!transaction) {
            throw new AppError(404, 'Transaction not found');
        }

        const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

        const receipt = await prisma.receipt.create({
            data: {
                transactionId: transaction.id,
                receiptNumber,
            },
        });

        return receipt;
    }

    private async calculateAgentCommission(transactionId: string, agentId: string, amount: number) {
        const commissionPercentage = 2.5; // 2.5% commission
        const commissionAmount = (amount * commissionPercentage) / 100;

        await prisma.agentCommission.create({
            data: {
                agentId,
                transactionId,
                percentage: commissionPercentage,
                amount: commissionAmount,
                status: 'PENDING',
            },
        });
    }

    async getTransactionById(id: string) {
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                vehicle: true,
                user: true,
                receipt: true,
            },
        });

        if (!transaction) {
            throw new AppError(404, 'Transaction not found');
        }

        return transaction;
    }

    async processRefund(transactionId: string, reason: string) {
        const transaction = await this.getTransactionById(transactionId);

        if (transaction.status !== 'SUCCESS') {
            throw new AppError(400, 'Only successful transactions can be refunded');
        }

        // TODO: Implement actual refund with payment gateway
        // For now, just update the status

        const updated = await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: 'REFUNDED',
                metadata: {
                    ...(transaction.metadata as any),
                    refundReason: reason,
                    refundedAt: new Date(),
                },
            },
        });

        return updated;
    }
}

export default new PaymentService();
