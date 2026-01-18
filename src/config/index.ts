import dotenv from 'dotenv';

dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    apiVersion: process.env.API_VERSION || 'v1',

    database: {
        url: process.env.DATABASE_URL!,
    },

    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },

    jwt: {
        secret: process.env.JWT_SECRET!,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshSecret: process.env.REFRESH_TOKEN_SECRET!,
        refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    },

    paystack: {
        secretKey: process.env.PAYSTACK_SECRET_KEY!,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY!,
    },

    flutterwave: {
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
        publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY!,
    },

    email: {
        sendgridApiKey: process.env.SENDGRID_API_KEY!,
        from: process.env.EMAIL_FROM || 'noreply@motopay.pl.gov.ng',
        fromName: process.env.EMAIL_FROM_NAME || 'Plateau MotoPay',
    },

    sms: {
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
        twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
        termiiApiKey: process.env.TERMII_API_KEY,
        termiiSenderId: process.env.TERMII_SENDER_ID || 'MotoPay',
    },

    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        s3Bucket: process.env.AWS_S3_BUCKET,
        region: process.env.AWS_REGION || 'us-east-1',
    },

    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },

    admin: {
        email: process.env.ADMIN_EMAIL || 'admin@psirs.gov.ng',
        password: process.env.ADMIN_PASSWORD!,
    },

    legacy: {
        dbUrl: process.env.LEGACY_DB_URL,
        apiKey: process.env.LEGACY_API_KEY,
    },
};

// Validate required config (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
    const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'REFRESH_TOKEN_SECRET',
        'PAYSTACK_SECRET_KEY',
        'ADMIN_PASSWORD',
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        );
    }
}
