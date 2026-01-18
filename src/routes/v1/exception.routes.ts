import { Router } from 'express';
import exceptionController from '../../controllers/exception.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// Public can create exceptions (vehicle not found)
router.post('/', exceptionController.createException);

// Admin/Staff routes (protected)
router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/', exceptionController.getExceptions);
router.get('/:id', exceptionController.getException);
router.post('/:id/assign', exceptionController.assignException);
router.put('/:id/status', exceptionController.updateStatus);
router.post('/:id/resolve', exceptionController.resolveException);
router.post('/bulk-assign', exceptionController.bulkAssign);

export default router;
