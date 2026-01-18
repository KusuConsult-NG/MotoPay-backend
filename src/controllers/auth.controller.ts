import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { LoginCredentials, RegisterData, ApiResponse } from '../types';

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const data: RegisterData = req.body;
            const user = await authService.register(data);

            const response: ApiResponse = {
                success: true,
                message: 'Registration successful',
                data: user,
            };

            return res.status(201).json(response);
        } catch (error) {
            return next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const credentials: LoginCredentials = req.body;
            const result = await authService.login(credentials);

            const response: ApiResponse = {
                success: true,
                message: 'Login successful',
                data: result,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required',
                });
            }

            const result = await authService.refreshAccessToken(refreshToken);

            const response: ApiResponse = {
                success: true,
                message: 'Token refreshed successfully',
                data: result,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;

            if (refreshToken) {
                await authService.logout(refreshToken);
            }

            const response: ApiResponse = {
                success: true,
                message: 'Logout successful',
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const response: ApiResponse = {
                success: true,
                message: 'User retrieved successfully',
                data: req.user,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { oldPassword, newPassword } = req.body;
            const userId = req.user!.id;

            await authService.changePassword(userId, oldPassword, newPassword);

            const response: ApiResponse = {
                success: true,
                message: 'Password changed successfully',
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const result = await authService.requestPasswordReset(email);

            const response: ApiResponse = {
                success: true,
                message: result.message,
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, newPassword } = req.body;
            await authService.resetPassword(token, newPassword);

            const response: ApiResponse = {
                success: true,
                message: 'Password reset successful',
            };

            return res.json(response);
        } catch (error) {
            return next(error);
        }
    }
}

export default new AuthController();
