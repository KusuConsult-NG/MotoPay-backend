import winston from 'winston';
import { config } from './index';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const logger = winston.createLogger({
    level: config.env === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'motopay-api' },
    transports: [
        // Use console transport for all environments
        // In production (Vercel), console output is captured in logs
        // File-based logging fails on Vercel's read-only filesystem
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
    ],
});

export default logger;
