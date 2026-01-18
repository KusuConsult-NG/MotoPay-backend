import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import logger from './config/logger';
import v1Routes from './routes/v1';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimiter.middleware';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.frontend.url,
    credentials: true,
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    }));
}

// API routes
app.use(`/api/${config.apiVersion}`, v1Routes);

// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Welcome to MotoPay API',
        version: config.apiVersion,
        documentation: '/api/docs',
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`✓ Server started successfully`);
        logger.info(`✓ Environment: ${config.env}`);
        logger.info(`✓ Port: ${PORT}`);
        logger.info(`✓ API Version: ${config.apiVersion}`);
        logger.info(`✓ URL: http://localhost:${PORT}`);
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

export default app;
