import { Router } from 'express';
import agentController from '../../controllers/agent.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// All agent routes require AGENT role
router.use(authenticate, authorize('AGENT'));

// Agent registration and management
router.post('/register', agentController.registerAgent);

// Commission tracking
router.get('/commissions', agentController.getMyCommissions);
router.get('/commissions/export', agentController.exportCommissions);

// Transaction history
router.get('/transactions', agentController.getMyTransactions);

// Summary/Dashboard
router.get('/summary', agentController.getMySummary);

// Assisted renewal
router.post('/assisted-renewal', agentController.processAssistedRenewal);

export default router;
