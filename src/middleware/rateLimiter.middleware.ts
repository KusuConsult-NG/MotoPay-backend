import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const generalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        success: false,
        message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes',
    },
    skipSuccessfulRequests: true,
});

export const paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 payment attempts per minute
    message: {
        success: false,
        message: 'Too many payment requests, please wait a moment',
    },
});
