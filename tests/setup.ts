import { beforeAll, afterAll } from '@jest/globals';
import prisma from '../src/config/database';

beforeAll(async () => {
    // Setup test database
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/motopay_test';
});

afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
});
