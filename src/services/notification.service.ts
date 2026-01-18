import cron from 'node-cron';
import prisma from '../config/database';
import emailService from '../services/email.service';
import smsService from '../services/sms.service';
import logger from '../config/logger';

export class NotificationService {
    // Send renewal reminders daily at 9 AM
    startRenewalReminders() {
        cron.schedule('0 9 * * *', async () => {
            logger.info('Running renewal reminder job...');

            const now = new Date();
            const thirtyDaysLater = new Date();
            thirtyDaysLater.setDate(now.getDate() + 30);

            // Find compliance items expiring in 30 days
            const expiringCompliance = await prisma.vehicleCompliance.findMany({
                where: {
                    expiryDate: {
                        gte: now,
                        lte: thirtyDaysLater,
                    },
                    status: 'ACTIVE',
                },
                include: {
                    vehicle: true,
                    complianceItem: true,
                },
            });

            for (const comp of expiringCompliance) {
                const daysRemaining = Math.ceil(
                    (new Date(comp.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );

                // Only send reminders at 30, 14, 7, and 1 days
                if ([30, 14, 7, 1].includes(daysRemaining)) {
                    try {
                        await emailService.sendRenewalReminder(comp.vehicle.ownerContact, {
                            vehiclePlate: comp.vehicle.plateNumber,
                            complianceItem: comp.complianceItem.name,
                            expiryDate: new Date(comp.expiryDate).toLocaleDateString(),
                            daysRemaining,
                        });

                        await smsService.sendRenewalReminder(
                            comp.vehicle.ownerContact,
                            comp.vehicle.plateNumber,
                            daysRemaining
                        );

                        logger.info(`Renewal reminder sent for vehicle ${comp.vehicle.plateNumber}`);
                    } catch (error) {
                        logger.error(error); `Reminder failed for ${comp.vehicle.plateNumber}:`, error);
    }
}
      }

logger.info(`Renewal reminder job completed. Processed ${expiringCompliance.length} items.`);
    });

logger.info('Renewal reminder scheduler started');
  }

  // Send payment confirmation
  async sendPaymentConfirmation(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
            vehicle: true,
            receipt: true,
        },
    });

    if (!transaction || !transaction.receipt) {
        throw new Error('Transaction or receipt not found');
    }

    // Send email
    await emailService.sendPaymentConfirmation(transaction.vehicle.ownerContact, {
        receiptNumber: transaction.receipt.receiptNumber,
        amount: Number(transaction.totalAmount),
        vehiclePlate: transaction.vehicle.plateNumber,
        transactionRef: transaction.reference,
    });

    // Send SMS
    await smsService.sendPaymentConfirmation(
        transaction.vehicle.ownerContact,
        Number(transaction.totalAmount),
        transaction.receipt.receiptNumber
    );

    // Update receipt
    await prisma.receipt.update({
        where: { id: transaction.receipt.id },
        data: { emailSentAt: new Date() },
    });

    logger.info(`Payment confirmation sent for transaction ${transaction.reference}`);
}
}

export default new NotificationService();
