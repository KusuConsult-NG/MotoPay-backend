
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const generateReference = (prefix: string): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

export const generateTicketNumber = (): string => {
    const random = Math.floor(Math.random() * 90000) + 10000;
    return `VR-${random}`;
};

export const generateReceiptNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP-${year}${month}-${random}`;
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
    }).format(amount);
};

export const calculateFee = (amount: number, percentage: number = 1.5): number => {
    return Math.round(amount * (percentage / 100) * 100) / 100;
};

export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const validatePlateNumber = (plateNumber: string): boolean => {
    const platePattern = /^[A-Z]{2,3}-\d{2,3}-[A-Z]{2,3}$/i;
    return platePattern.test(plateNumber);
};

export const validateVIN = (vin: string): boolean => {
    return vin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
};

export const validateTIN = (tin: string): boolean => {
    return tin.length === 10 && /^\d{10}$/.test(tin);
};

export const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
};

export const paginate = (page: number, limit: number) => {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
};

export const calculatePagination = (total: number, page: number, limit: number) => {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};
