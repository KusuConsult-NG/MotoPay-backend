import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/database';
import { AppError, addDays } from '../utils/helpers';
import { LoginCredentials, RegisterData, TokenPayload } from '../types';

export class AuthService {
    private readonly SALT_ROUNDS = 12;

    async register(data: RegisterData) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new AppError(409, 'User with this email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                fullName: data.fullName,
                phoneNumber: data.phoneNumber,
                role: 'PUBLIC',
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                phoneNumber: true,
                role: true,
                createdAt: true,
            },
        });

        return user;
    }

    async login(credentials: LoginCredentials) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: credentials.email },
        });

        if (!user) {
            throw new AppError(401, 'Invalid email or password');
        }

        if (!user.isActive) {
            throw new AppError(403, 'Your account has been deactivated');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid email or password');
        }

        // Generate tokens
        const tokenPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = jwt.sign(tokenPayload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        } as jwt.SignOptions);

        const refreshToken = jwt.sign(tokenPayload, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiresIn,
        } as jwt.SignOptions);

        // Store refresh token
        const expiresAt = addDays(new Date(), 7);
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            // Verify refresh token
            jwt.verify(
                refreshToken,
                config.jwt.refreshSecret
            ) as TokenPayload;

            // Check if refresh token exists in database
            const storedToken = await prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true },
            });

            if (!storedToken) {
                throw new AppError(401, 'Invalid refresh token');
            }

            if (storedToken.expiresAt < new Date()) {
                await prisma.refreshToken.delete({ where: { id: storedToken.id } });
                throw new AppError(401, 'Refresh token expired');
            }

            if (!storedToken.user.isActive) {
                throw new AppError(403, 'User account is inactive');
            }

            // Generate new access token
            const tokenPayload: TokenPayload = {
                userId: storedToken.user.id,
                email: storedToken.user.email,
                role: storedToken.user.role,
            };

            const accessToken = jwt.sign(tokenPayload, config.jwt.secret, {
                expiresIn: config.jwt.expiresIn,
            } as jwt.SignOptions);

            return { accessToken };
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AppError(401, 'Invalid refresh token');
            }
            throw error;
        }
    }

    async logout(refreshToken: string) {
        await prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);

        if (!isPasswordValid) {
            throw new AppError(401, 'Current password is incorrect');
        }

        const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
    }

    async requestPasswordReset(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists
            return { message: 'If the email exists, a reset link will be sent' };
        }

        // Generate reset token (expires in 1 hour)
        const resetToken = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwt.secret,
            { expiresIn: '1h' } as jwt.SignOptions
        );

        // TODO: Send email with reset link
        // await emailService.sendPasswordResetEmail(user.email, resetToken);

        return { message: 'If the email exists, a reset link will be sent' };
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;

            const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

            await prisma.user.update({
                where: { id: decoded.userId },
                data: { passwordHash },
            });
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AppError(400, 'Invalid or expired reset token');
            }
            throw error;
        }
    }
}

export default new AuthService();
