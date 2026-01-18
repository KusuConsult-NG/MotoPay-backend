import { Request, Response, NextFunction } from 'express';
import csrf from 'csurf';

// CSRF Protection middleware
export const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    },
});

export const provideCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    res.locals.csrfToken = req.csrfToken?.();
    return next();
};

// Get CSRF token endpoint
export const getCsrfToken = (req: Request, res: Response) => {
    return res.json({
        success: true,
        data: {
            csrfToken: req.csrfToken?.(),
        },
    });
};
