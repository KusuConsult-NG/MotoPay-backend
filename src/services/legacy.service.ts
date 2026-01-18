import axios from 'axios';
import { config } from '../config';
import logger from '../config/logger';

interface LegacyVehicle {
    plateNumber: string;
    chassisNumber: string;
    engineNumber: string;
    make: string;
    model: string;
    year: number;
    ownerName: string;
    ownerContact: string;
    tin?: string;
    registrationDate: Date;
}

export class LegacySystemService {
    private apiUrl: string;
    private apiKey: string;

    constructor() {
        this.apiUrl = config.legacy.dbUrl || 'http://legacy-api.psirs.gov.ng';
        this.apiKey = config.legacy.apiKey || '';
    }

    /**
     * Lookup vehicle in legacy system
     */
    async lookupVehicle(plateNumber: string): Promise<LegacyVehicle | null> {
        try {
            // If no legacy system configured, return null
            if (!this.apiKey) {
                logger.warn('Legacy system not configured');
                return null;
            }

            const response = await axios.get(`${this.apiUrl}/api/vehicles/${plateNumber}`, {
                headers: {
                    'X-API-Key': this.apiKey,
                },
                timeout: 5000, // 5 second timeout
            });

            if (response.data && response.data.success) {
                return this.transformLegacyData(response.data.data);
            }

            return null;
        } catch (error: any) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                logger.warn('Legacy system unavailable');
                return null;
            }

            logger.error('Legacy system error:', error.message);
            return null;
        }
    }

    /**
     * Search vehicle by multiple criteria
     */
    async searchVehicle(criteria: {
        plateNumber?: string;
        chassisNumber?: string;
        tin?: string;
    }): Promise<LegacyVehicle | null> {
        try {
            if (!this.apiKey) return null;

            const query = new URLSearchParams();
            if (criteria.plateNumber) query.append('plate', criteria.plateNumber);
            if (criteria.chassisNumber) query.append('chassis', criteria.chassisNumber);
            if (criteria.tin) query.append('tin', criteria.tin);

            const response = await axios.get(`${this.apiUrl}/api/vehicles/search?${query.toString()}`, {
                headers: {
                    'X-API-Key': this.apiKey,
                },
                timeout: 5000,
            });

            if (response.data && response.data.data && response.data.data.length > 0) {
                return this.transformLegacyData(response.data.data[0]);
            }

            return null;
        } catch (error) {
            logger.error('Legacy search error:', error);
            return null;
        }
    }

    /**
     * Sync vehicle data from legacy to new system
     */
    async syncVehicle(plateNumber: string): Promise<LegacyVehicle | null> {
        const vehicle = await this.lookupVehicle(plateNumber);

        if (vehicle) {
            logger.info(`Successfully synced vehicle ${plateNumber} from legacy system`);
        }

        return vehicle;
    }

    /**
     * Transform legacy data format to our format
     */
    private transformLegacyData(legacyData: any): LegacyVehicle {
        return {
            plateNumber: legacyData.plate_number || legacyData.plateNumber,
            chassisNumber: legacyData.chassis_number || legacyData.chassisNumber,
            engineNumber: legacyData.engine_number || legacyData.engineNumber,
            make: legacyData.make,
            model: legacyData.model,
            year: parseInt(legacyData.year),
            ownerName: legacyData.owner_name || legacyData.ownerName,
            ownerContact: legacyData.owner_contact || legacyData.ownerContact,
            tin: legacyData.tin,
            registrationDate: new Date(legacyData.registration_date || legacyData.registrationDate),
        };
    }

    /**
     * Mock data for testing when legacy system is unavailable
     */
    getMockVehicle(plateNumber: string): LegacyVehicle {
        return {
            plateNumber: plateNumber,
            chassisNumber: '1HGCG2253YA000000',
            engineNumber: 'G4KH-0000000',
            make: 'Toyota',
            model: 'Corolla',
            year: 2015,
            ownerName: 'Legacy System User',
            ownerContact: '+2348000000000',
            tin: '0000000000',
            registrationDate: new Date('2015-01-01'),
        };
    }

    /**
     * Check if legacy system is available
     */
    async healthCheck(): Promise<boolean> {
        try {
            if (!this.apiKey) return false;

            const response = await axios.get(`${this.apiUrl}/api/health`, {
                headers: {
                    'X-API-Key': this.apiKey,
                },
                timeout: 3000,
            });

            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}

export default new LegacySystemService();
