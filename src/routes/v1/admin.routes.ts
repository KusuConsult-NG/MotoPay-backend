import { Router } from 'express';
import adminController from '../../controllers/admin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// All admin routes require ADMIN or SUPER_ADMIN role
router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/metrics', adminController.getDashboardMetrics);
router.get('/transactions', adminController.getTransactions);
router.get('/collections', adminController.getCollections);
router.post('/export', adminController.exportReport);

export default router;
