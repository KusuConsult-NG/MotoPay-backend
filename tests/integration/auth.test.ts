import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';

describe('Auth API Integration Tests', () => {
    beforeAll(async () => {
        // Clean up test data
        await prisma.user.deleteMany({
            where: { email: { contains: 'test' } },
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'Test123!@#',
                    fullName: 'Test User',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('email', 'test@example.com');
        });

        it('should reject duplicate email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'Test123!@#',
                    fullName: 'Duplicate User',
                });

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
        });

        it('should reject weak password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'test2@example.com',
                    password: '123',
                    fullName: 'Test User 2',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Test123!@#',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');
        });

        it('should reject invalid password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
