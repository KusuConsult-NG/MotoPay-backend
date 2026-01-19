import { Router } from 'express';
import authRoutes from './auth.routes';
import vehicleRoutes from './vehicle.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';
import agentRoutes from './agent.routes';
import exceptionRoutes from './exception.routes';
import complianceRoutes from './compliance.routes';
import searchRoutes from './search.routes';
import contactRoutes from './contact.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/agents', agentRoutes);
router.use('/exceptions', exceptionRoutes);
router.use('/compliance', complianceRoutes);
router.use('/search', searchRoutes);
router.use('/contact', contactRoutes);

// Health check
router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'MotoPay API Service is healthy',
        timestamp: new Date().toISOString(),
    });
});

export default router;
