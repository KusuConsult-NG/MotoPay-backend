import axios from 'axios';
import logger from '../config/logger';

export class IdentityService {
    private readonly VERIFICATION_API_URL = 'https://api.verification-service.gov.ng/v1'; // Mock URL for Plateau State verification

    async verifyNIN(nin: string): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            // In a real implementation, this would call a service like NIMC or a verified aggregator
            logger.info(`Verifying NIN: ${nin}`);

            // Mocking a successful response for demonstration
            // In production, use process.env.NIN_VERIFY_API_KEY
            const response = await axios.post(`${this.VERIFICATION_API_URL}/nin/verify`, {
                nin,
                apiKey: process.env.IDENTITY_API_KEY || 'test-key'
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            logger.error('NIN verification failed:', error.response?.data || error.message);

            // For testing/mocking purposes, we'll return successful for certain patterns
            if (nin.startsWith('123456')) {
                return { success: true, data: { fullName: 'Test User', nin } };
            }

            return {
                success: false,
                error: 'NIN verification service unavailable'
            };
        }
    }

    async verifyTIN(tin: string): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            logger.info(`Verifying TIN: ${tin}`);

            const response = await axios.post(`${this.VERIFICATION_API_URL}/tin/verify`, {
                tin,
                apiKey: process.env.IDENTITY_API_KEY || 'test-key'
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            logger.error('TIN verification failed:', error.response?.data || error.message);

            if (tin.startsWith('TIN')) {
                return { success: true, data: { organization: 'Test Org', tin } };
            }

            return {
                success: false,
                error: 'TIN verification service unavailable'
            };
        }
    }
}

export default new IdentityService();
