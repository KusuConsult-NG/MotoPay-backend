import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MotoPay API Documentation',
            version: '1.0.0',
            description: 'Plateau State Vehicle Levy and Insurance Management System API',
            contact: {
                name: 'Plateau State Internal Revenue Service',
                email: 'support@motopay.pl.gov.ng',
            },
            license: {
                name: 'Proprietary',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
            {
                url: 'https://api.motopay.pl.gov.ng',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        error: { type: 'string' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        fullName: { type: 'string' },
                        role: { type: 'string', enum: ['PUBLIC', 'AGENT', 'ADMIN', 'SUPER_ADMIN'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Vehicle: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        plateNumber: { type: 'string', example: 'PL-582-KN' },
                        chassisNumber: { type: 'string' },
                        make: { type: 'string' },
                        model: { type: 'string' },
                        year: { type: 'integer' },
                        vehicleType: { type: 'string', enum: ['PRIVATE', 'COMMERCIAL', 'TRUCK', 'MOTORCYCLE', 'TRICYCLE'] },
                        ownerName: { type: 'string' },
                        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] },
                    },
                },
                Transaction: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        reference: { type: 'string' },
                        amount: { type: 'number' },
                        status: { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/v1/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'MotoPay API Docs',
    }));

    app.get('/api/docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

export default swaggerSpec;
