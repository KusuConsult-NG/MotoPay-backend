import { describe, it, expect } from '@jest/globals';
import * as helpers from '../../src/utils/helpers';

describe('Helper Functions', () => {
    describe('validatePlateNumber', () => {
        it('should validate correct plate number format', () => {
            expect(helpers.validatePlateNumber('PL-582-KN')).toBe(true);
            expect(helpers.validatePlateNumber('ABC-123-XYZ')).toBe(true);
        });

        it('should reject invalid plate number format', () => {
            expect(helpers.validatePlateNumber('INVALID')).toBe(false);
            expect(helpers.validatePlateNumber('12-34-56')).toBe(false);
        });
    });

    describe('validateVIN', () => {
        it('should validate correct VIN', () => {
            expect(helpers.validateVIN('1HGCG2253YA120412')).toBe(true);
        });

        it('should reject invalid VIN', () => {
            expect(helpers.validateVIN('SHORT')).toBe(false);
            expect(helpers.validateVIN('1234567890123456O')).toBe(false); // Contains 'O'
        });
    });

    describe('validateTIN', () => {
        it('should validate correct TIN', () => {
            expect(helpers.validateTIN('1023456789')).toBe(true);
        });

        it('should reject invalid TIN', () => {
            expect(helpers.validateTIN('123')).toBe(false);
            expect(helpers.validateTIN('abcdefghij')).toBe(false);
        });
    });

    describe('formatCurrency', () => {
        it('should format currency correctly', () => {
            const formatted = helpers.formatCurrency(12500);
            expect(formatted).toContain('12,500');
        });
    });

    describe('calculateFee', () => {
        it('should calculate fee correctly', () => {
            expect(helpers.calculateFee(10000, 1.5)).toBe(150);
            expect(helpers.calculateFee(5000, 2)).toBe(100);
        });
    });

    describe('generateReference', () => {
        it('should generate reference with prefix', () => {
            const ref = helpers.generateReference('TXN');
            expect(ref).toMatch(/^TXN-/);
        });
    });
});
