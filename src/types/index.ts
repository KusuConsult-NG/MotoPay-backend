export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
}

export interface VehicleLookupQuery {
    tin?: string;
    plateNumber?: string;
    chassisNumber?: string;
}

export interface PaymentInitialization {
    vehicleId: string;
    complianceItems: string[];
    email: string;
    amount: number;
    paymentMethod: 'CARD' | 'USSD' | 'BANK_TRANSFER';
}

export interface WebhookPayload {
    event: string;
    data: any;
}
