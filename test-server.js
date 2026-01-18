#!/usr/bin/env node

/**
 * Simple API Test Server
 * 
 * This is a minimal Express server to test routes without Prisma
 * It uses mock data to verify the API structure is correct
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Mock responses
const mockResponses = {
    health: {
        success: true,
        message: 'MotoPay API is running',
        timestamp: new Date().toISOString(),
    },

    register: {
        success: true,
        message: 'Registration successful',
        data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            fullName: 'Test User',
            role: 'PUBLIC',
        },
    },

    login: {
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'admin@psirs.gov.ng',
                fullName: 'System Administrator',
                role: 'SUPER_ADMIN',
            },
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token',
            refreshToken: 'mock.refresh.token',
        },
    },

    vehicleLookup: {
        success: true,
        message: 'Vehicle found',
        data: {
            id: '234e4567-e89b-12d3-a456-426614174001',
            plateNumber: 'PL-582-KN',
            chassisNumber: '1HGCG2253YA120412',
            make: 'Toyota',
            model: 'Camry',
            year: 2018,
            vehicleType: 'PRIVATE',
            ownerName: 'Musa Ibrahim',
            status: 'ACTIVE',
        },
    },

    adminMetrics: {
        success: true,
        message: 'Dashboard metrics retrieved',
        data: {
            dailyCollections: {
                amount: 425000,
                count: 14,
            },
            pendingValidations: 3,
            activeExceptions: 18,
            totalVehicles: 1542,
            totalTransactions: 3892,
        },
    },
};

// Routes

// Health check
app.get('/api/v1/health', (req, res) => {
    res.json(mockResponses.health);
});

// Auth routes
app.post('/api/v1/auth/register', (req, res) => {
    res.status(201).json(mockResponses.register);
});

app.post('/api/v1/auth/login', (req, res) => {
    res.json(mockResponses.login);
});

app.get('/api/v1/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
    }
    res.json({
        success: true,
        data: mockResponses.login.data.user,
    });
});

// Vehicle routes
app.post('/api/v1/vehicles/lookup', (req, res) => {
    res.json(mockResponses.vehicleLookup);
});

app.get('/api/v1/vehicles/:id', (req, res) => {
    res.json(mockResponses.vehicleLookup);
});

app.get('/api/v1/vehicles/:id/compliance', (req, res) => {
    res.json({
        success: true,
        message: 'Compliance status retrieved',
        data: {
            vehicle: {
                id: req.params.id,
                plateNumber: 'PL-582-KN',
            },
            compliance: {
                active: [
                    {
                        id: '1',
                        complianceItem: {
                            name: 'Road Worthiness',
                            price: 12500,
                        },
                        expiryDate: '2024-12-31',
                    },
                ],
                expired: [
                    {
                        id: '2',
                        complianceItem: {
                            name: 'Insurance',
                            price: 5000,
                        },
                        expiryDate: '2023-12-31',
                    },
                ],
                pending: [],
            },
            summary: {
                totalItems: 2,
                activeCount: 1,
                expiredCount: 1,
                pendingCount: 0,
            },
        },
    });
});

// Payment routes
app.post('/api/v1/payments/initialize', (req, res) => {
    res.json({
        success: true,
        message: 'Payment initialized',
        data: {
            transactionId: '345e4567-e89b-12d3-a456-426614174002',
            reference: 'TXN-1234567890',
            authorizationUrl: 'https://checkout.paystack.com/mock',
            accessCode: 'mock_access_code',
        },
    });
});

app.post('/api/v1/payments/verify/:reference', (req, res) => {
    res.json({
        success: true,
        message: 'Payment verified',
        data: {
            id: '345e4567-e89b-12d3-a456-426614174002',
            reference: req.params.reference,
            amount: 25000,
            status: 'SUCCESS',
        },
    });
});

app.get('/api/v1/payments/transaction/:id', (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.params.id,
            reference: 'TXN-1234567890',
            amount: 25000,
            status: 'SUCCESS',
            createdAt: new Date().toISOString(),
        },
    });
});

// Admin routes
app.get('/api/v1/admin/metrics', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
    }
    res.json(mockResponses.adminMetrics);
});

app.get('/api/v1/admin/transactions', (req, res) => {
    res.json({
        success: true,
        data: {
            transactions: [
                {
                    id: '1',
                    reference: 'TXN-8923041',
                    amount: 12500,
                    status: 'SUCCESS',
                    channel: 'SELF',
                    createdAt: new Date().toISOString(),
                },
            ],
            pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
            },
        },
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        error: `Cannot ${req.method} ${req.path}`,
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message,
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 MotoPay Mock API Server');
    console.log('================================');
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ API Version: v1`);
    console.log(`✓ Mode: Mock/Testing`);
    console.log('');
    console.log('Available endpoints:');
    console.log('- GET  /api/v1/health');
    console.log('- POST /api/v1/auth/register');
    console.log('- POST /api/v1/auth/login');
    console.log('- GET  /api/v1/auth/me');
    console.log('- POST /api/v1/vehicles/lookup');
    console.log('- GET  /api/v1/vehicles/:id');
    console.log('- GET  /api/v1/vehicles/:id/compliance');
    console.log('- POST /api/v1/payments/initialize');
    console.log('- POST /api/v1/payments/verify/:reference');
    console.log('- GET  /api/v1/payments/transaction/:id');
    console.log('- GET  /api/v1/admin/metrics');
    console.log('- GET  /api/v1/admin/transactions');
    console.log('');
    console.log('Test it: curl http://localhost:' + PORT + '/api/v1/health');
    console.log('');
});
