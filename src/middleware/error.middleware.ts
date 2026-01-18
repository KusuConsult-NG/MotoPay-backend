import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/helpers';
import logger from '../config/logger';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof AppError) {
        logger.error(`AppError: ${err.message}`, {
            statusCode: err.statusCode,
            path: req.path,
            method: req.method,
        });

        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: err.isOperational ? err.message : 'Internal server error',
        });
    }

    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        logger.error('Prisma error:', err);
        return res.status(400).json({
            success: false,
            message: 'Database operation failed',
            error: 'Bad request',
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        logger.error('Validation error:', err);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            error: err.message,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        logger.error('JWT error:', err);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: 'Invalid or expired token',
        });
    }

    // Default error
    logger.error('Unhandled error:', err);
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
};

export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        error: `Cannot ${req.method} ${req.path}`,
    });
};
