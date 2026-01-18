import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../utils/helpers';
import { TokenPayload } from '../types';
import prisma from '../config/database';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: TokenPayload & { id: string };
        }
    }
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(401, 'Authentication required');
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;

            // Verify user still exists and is active
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, role: true, isActive: true },
            });

            if (!user || !user.isActive) {
                throw new AppError(401, 'User not found or inactive');
            }

            req.user = {
                id: user.id,
                userId: user.id,
                email: user.email,
                role: user.role,
            };

            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new AppError(401, 'Token expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AppError(401, 'Invalid token');
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError(401, 'Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError(403, 'You do not have permission to access this resource'));
        }

        next();
    };
};

export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            await authenticate(req, res, next);
        } catch (error) {
            // Continue without auth if token is invalid
            next();
        }
    } else {
        next();
    }
};
