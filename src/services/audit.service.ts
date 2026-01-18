import logger from '../config/logger';

export class AuditService {
    async logAction(data: {
        userId?: string;
        action: string;
        resource: string;
        resourceId?: string;
        details?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        logger.info('Audit Log:', {
            timestamp: new Date().toISOString(),
            ...data,
        });

        // In a production system, you'd want a dedicated audit_logs table
        // For now, we're using the Winston logger which is configured to write to files
        return {
            logged: true,
            timestamp: new Date(),
        };
    }

    async logPriceChange(complianceItemId: string, oldPrice: number, newPrice: number, changedBy: string, reason: string) {
        await this.logAction({
            userId: changedBy,
            action: 'PRICE_CHANGE',
            resource: 'COMPLIANCE_ITEM',
            resourceId: complianceItemId,
            details: {
                oldPrice,
                newPrice,
                reason,
            },
        });
    }

    async logExceptionResolution(exceptionId: string, resolvedBy: string, resolution: string) {
        await this.logAction({
            userId: resolvedBy,
            action: 'EXCEPTION_RESOLVED',
            resource: 'EXCEPTION',
            resourceId: exceptionId,
            details: {
                resolution,
            },
        });
    }

    async logPaymentAttempt(transactionId: string, success: boolean, details: any) {
        await this.logAction({
            action: success ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
            resource: 'TRANSACTION',
            resourceId: transactionId,
            details,
        });
    }
}

export default new AuditService();
