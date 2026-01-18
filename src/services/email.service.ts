import nodemailer from 'nodemailer';
import { config } from '../config';
import logger from '../config/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: config.email.sendgridApiKey,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to,
        subject,
        html,
      });

      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendPaymentConfirmation(to: string, data: {
    receiptNumber: string;
    amount: number;
    vehiclePlate: string;
    transactionRef: string;
  }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a472a; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; }
          .amount { font-size: 24px; color: #1a472a; font-weight: bold; }
          table { width: 100%; margin: 20px 0; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmation</h1>
            <p>Plateau State MotoPay</p>
          </div>
          <div class="content">
            <p>Dear Customer,</p>
            <p>Your payment has been successfully processed. Below are your transaction details:</p>
            
            <table>
              <tr>
                <td><strong>Receipt Number:</strong></td>
                <td>${data.receiptNumber}</td>
              </tr>
              <tr>
                <td><strong>Transaction Reference:</strong></td>
                <td>${data.transactionRef}</td>
              </tr>
              <tr>
                <td><strong>Vehicle Plate:</strong></td>
                <td>${data.vehiclePlate}</td>
              </tr>
              <tr>
                <td><strong>Amount Paid:</strong></td>
                <td class="amount">₦${data.amount.toLocaleString()}</td>
              </tr>
            </table>
            
            <p>Your receipt has been attached to this email. Please keep it for your records.</p>
            <p>Thank you for using MotoPay!</p>
          </div>
          <div class="footer">
            <p>Plateau State Internal Revenue Service</p>
            <p>For support, contact: support@motopay.pl.gov.ng</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, 'Payment Confirmation - MotoPay', html);
  }

  async sendRenewalReminder(to: string, data: {
    vehiclePlate: string;
    complianceItem: string;
    expiryDate: string;
    daysRemaining: number;
  }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ff6b6b; color: white; padding: 20px; text-align: center;">
            <h1>Renewal Reminder</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9; margin: 20px 0;">
            <p>Dear Vehicle Owner,</p>
            <p>This is a reminder that your <strong>${data.complianceItem}</strong> for vehicle <strong>${data.vehiclePlate}</strong> will expire in <strong>${data.daysRemaining} days</strong>.</p>
            <p><strong>Expiry Date:</strong> ${data.expiryDate}</p>
            <p>Please renew before the expiry date to avoid penalties.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${config.frontend.url}/renew" style="background: #1a472a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Renew Now</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, `Renewal Reminder - ${data.complianceItem}`, html);
  }

  async sendPasswordReset(to: string, resetToken: string) {
    const resetUrl = `${config.frontend.url}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a472a; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; }
          .button { background: #1a472a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p>Plateau State MotoPay</p>
          </div>
          <div class="content">
            <p>Dear User,</p>
            <p>You requested to reset your password for your MotoPay account. Click the button below to proceed:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>For your security, this link will expire in <strong>1 hour</strong>.</p>
            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>Plateau State Internal Revenue Service</p>
            <p>For support, contact: support@motopay.pl.gov.ng</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, 'Password Reset - MotoPay', html);
  }
}

export default new EmailService();
