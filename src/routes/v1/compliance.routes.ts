import { Router } from 'express';
import complianceController from '../../controllers/compliance.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/items', complianceController.getComplianceItems);
router.get('/items/:id', complianceController.getComplianceItem);

// Vehicle-specific compliance check
router.get('/vehicles/:vehicleId/requirements', complianceController.checkRequirements);

// Admin routes (protected)
router.put('/items/:id/price', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), complianceController.updatePrice);
router.get('/items/:id/history', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), complianceController.getPriceHistory);

export default router;
