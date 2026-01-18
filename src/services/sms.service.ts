import axios from 'axios';
import { config } from '../config';
import logger from '../config/logger';

export class SMSService {
    private async sendTwilioSMS(to: string, message: string) {
        const apiUrl = 'https://api.twilio.com/2010-04-01';
        const { twilioAccountSid, twilioAuthToken, twilioPhoneNumber } = config.sms;

        if (!twilioAccountSid || !twilioAuthToken) {
            throw new Error('Twilio configuration missing');
        }

        const response = await axios.post(
            `${apiUrl}/Accounts/${twilioAccountSid}/Messages.json`,
            new URLSearchParams({
                To: to,
                From: twilioPhoneNumber!,
                Body: message,
            }),
            {
                auth: {
                    username: twilioAccountSid,
                    password: twilioAuthToken,
                },
            }
        );
        return response.data;
    }

    private async sendTermiiSMS(to: string, message: string) {
        // Termii implementation
        const { termiiApiKey, termiiSenderId } = config.sms;

        if (!termiiApiKey) {
            throw new Error('Termii configuration missing');
        }

        const response = await axios.post('https://api.ng.termii.com/api/sms/send', {
            to,
            from: termiiSenderId || 'MotoPay',
            sms: message,
            type: 'plain',
            channel: 'generic',
            api_key: termiiApiKey,
        });
        return response.data;
    }

    async sendSMS(to: string, message: string) {
        try {
            const provider = process.env.SMS_PROVIDER || 'TWILIO';
            let result;

            if (provider === 'TERMII') {
                result = await this.sendTermiiSMS(to, message);
            } else {
                result = await this.sendTwilioSMS(to, message);
            }

            logger.info(`SMS sent to ${to} via ${provider}`);
            return result;
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
