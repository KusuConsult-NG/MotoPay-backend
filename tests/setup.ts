import { beforeAll, afterAll } from '@jest/globals';
import prisma from '../src/config/database';

beforeAll(async () => {
    // Setup test database
    process.env.NODE_ENV = 'test';
    // Use SQLite for testing (can be overridden by CI environment)
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = 'file:./test.db';
    }
});

afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
});
