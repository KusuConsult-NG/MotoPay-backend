import axios from 'axios';
import { config } from '../config';
import logger from '../config/logger';

export class SMSService {
    private apiUrl = 'https://api.twilio.com/2010-04-01';

    async sendSMS(to: string, message: string) {
        try {
            const response = await axios.post(
                `${this.apiUrl}/Accounts/${config.sms.twilioAccountSid}/Messages.json`,
                new URLSearchParams({
                    To: to,
                    From: config.sms.twilioPhoneNumber,
                    Body: message,
                }),
                {
                    auth: {
                        username: config.sms.twilioAccountSid,
                        password: config.sms.twilioAuthToken,
                    },
                }
            );

            logger.info(`SMS sent to ${to}: ${response.data.sid}`);
            return response.data;
        } catch (error: any) {
            logger.error('SMS sending failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async sendOTP(to: string, otp: string) {
        const message = `Your MotoPay verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
        return this.sendSMS(to, message);
    }

    async sendPaymentConfirmation(to: string, amount: number, receiptNumber: string) {
        const message = `Payment of ₦${amount.toLocaleString()} received. Receipt: ${receiptNumber}. Thank you for using MotoPay!`;
        return this.sendSMS(to, message);
    }

    async sendRenewalReminder(to: string, vehiclePlate: string, daysRemaining: number) {
        const message = `MotoPay Reminder: Your vehicle ${vehiclePlate} compliance expires in ${daysRemaining} days. Renew now at motopay.pl.gov.ng`;
        return this.sendSMS(to, message);
    }
}

export default new SMSService();
