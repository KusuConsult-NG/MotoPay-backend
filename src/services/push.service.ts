import admin from 'firebase-admin';
import logger from '../config/logger';

// Initialize Firebase Admin (only if credentials are provided)
let firebaseApp: admin.app.App | null = null;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        logger.info('Firebase Admin initialized for push notifications');
    }
} catch (error) {
    logger.warn('Firebase not configured, push notifications disabled');
}

export class PushNotificationService {
    private fcm: admin.messaging.Messaging | null = null;

    constructor() {
        if (firebaseApp) {
            this.fcm = firebaseApp.messaging();
        }
    }

    /**
     * Send push notification to single device
     */
    async sendToDevice(token: string, notification: {
        title: string;
        body: string;
        data?: Record<string, string>;
    }): Promise<boolean> {
        if (!this.fcm) {
            logger.warn('FCM not configured, skipping push notification');
            return false;
        }

        try {
            const message: admin.messaging.Message = {
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
                data: notification.data,
                token,
            };

            const response = await this.fcm.send(message);
            logger.info(`Push notification sent: ${response}`);
            return true;
        } catch (error: any) {
            logger.error('Push notification error:', error.message);
            return false;
        }
    }

    /**
     * Send to multiple devices
     */
    async sendToMultipleDevices(tokens: string[], notification: {
        title: string;
        body: string;
        data?: Record<string, string>;
    }): Promise<{ success: number; failure: number }> {
        if (!this.fcm || tokens.length === 0) {
            return { success: 0, failure: 0 };
        }

        try {
            const message: admin.messaging.MulticastMessage = {
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
                data: notification.data,
                tokens,
            };

            const response = await this.fcm.sendEachForMulticast(message);

            logger.info(`Multicast notification: ${response.successCount} success, ${response.failureCount} failed`);

            return {
                success: response.successCount,
                failure: response.failureCount,
            };
        } catch (error: any) {
            logger.error('Multicast notification error:', error.message);
            return { success: 0, failure: tokens.length };
        }
    }

    /**
     * Send payment confirmation push notification
     */
    async sendPaymentConfirmation(token: string, amount: number, receiptNumber: string): Promise<boolean> {
        return this.sendToDevice(token, {
            title: 'Payment Successful',
            body: `Your payment of ₦${amount.toLocaleString()} has been confirmed. Receipt: ${receiptNumber}`,
            data: {
                type: 'payment_confirmation',
                receiptNumber,
                amount: amount.toString(),
            },
        });
    }

    /**
     * Send renewal reminder push notification
     */
    async sendRenewalReminder(token: string, vehiclePlate: string, daysRemaining: number): Promise<boolean> {
        return this.sendToDevice(token, {
            title: 'Renewal Reminder',
            body: `Your vehicle ${vehiclePlate} compliance expires in ${daysRemaining} days. Renew now to avoid penalties.`,
            data: {
                type: 'renewal_reminder',
                vehiclePlate,
                daysRemaining: daysRemaining.toString(),
            },
        });
    }

    /**
     * Subscribe token to topic
     */
    async subscribeToTopic(tokens: string | string[], topic: string): Promise<boolean> {
        if (!this.fcm) return false;

        try {
            const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
            await this.fcm.subscribeToTopic(tokenArray, topic);
            logger.info(`Subscribed ${tokenArray.length} tokens to topic: ${topic}`);
            return true;
        } catch (error: any) {
            logger.error('Topic subscription error:', error.message);
            return false;
        }
    }

    /**
     * Send notification to topic
     */
    async sendToTopic(topic: string, notification: {
        title: string;
        body: string;
        data?: Record<string, string>;
    }): Promise<boolean> {
        if (!this.fcm) return false;

        try {
            const message: admin.messaging.Message = {
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
                data: notification.data,
                topic,
            };

            const response = await this.fcm.send(message);
            logger.info(`Topic notification sent: ${response}`);
            return true;
        } catch (error: any) {
            logger.error('Topic notification error:', error.message);
            return false;
        }
    }
}

export default new PushNotificationService();
