import { Router } from 'express';
import searchController from '../../controllers/search.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Protected search routes
router.use(authenticate);

router.get('/global', searchController.globalSearch);
router.get('/filter', searchController.advancedFilter);

export default router;
