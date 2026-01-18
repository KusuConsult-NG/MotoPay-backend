import Joi from 'joi';

// Vehicle validation schemas
export const vehicleLookupSchema = Joi.object({
    tin: Joi.string().length(10).pattern(/^\d+$/),
    plateNumber: Joi.string().pattern(/^[A-Z]{2,3}-\d{2,3}-[A-Z]{2,3}$/i),
    chassisNumber: Joi.string().min(17).max(17),
}).or('tin', 'plateNumber', 'chassisNumber');

export const vehicleRegistrationSchema = Joi.object({
    tin: Joi.string().length(10).pattern(/^\d+$/).optional(),
    plateNumber: Joi.string().pattern(/^[A-Z]{2,3}-\d{2,3}-[A-Z]{2,3}$/i).required(),
    chassisNumber: Joi.string().length(17).required(),
    engineNumber: Joi.string().required(),
    make: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    vehicleType: Joi.string().valid('PRIVATE', 'COMMERCIAL', 'TRUCK', 'MOTORCYCLE', 'TRICYCLE').required(),
    ownerName: Joi.string().required(),
    ownerContact: Joi.string().required(),
});

// Auth validation schemas
export const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().min(3).required(),
    phoneNumber: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    rememberMe: Joi.boolean().optional(),
});

// Payment validation schemas
export const paymentInitSchema = Joi.object({
    vehicleId: Joi.string().uuid().required(),
    complianceItems: Joi.array().items(Joi.string().uuid()).min(1).required(),
    email: Joi.string().email().required(),
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('CARD', 'USSD', 'BANK_TRANSFER').required(),
});

// Exception validation schemas
export const createExceptionSchema = Joi.object({
    type: Joi.string().valid('VEHICLE_NOT_FOUND', 'DUPLICATE', 'DOCUMENT_MISMATCH', 'OTHER').required(),
    userSubmittedData: Joi.object().required(),
    plateNumber: Joi.string().optional(),
    chassisNumber: Joi.string().optional(),
    evidenceUrls: Joi.array().items(Joi.string().uri()).optional(),
});

// Price update validation schema
export const priceUpdateSchema = Joi.object({
    newPrice: Joi.number().positive().required(),
    reason: Joi.string().min(10).required(),
});
