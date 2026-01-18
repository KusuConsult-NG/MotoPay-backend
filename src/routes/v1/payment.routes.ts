import { Router } from 'express';
import paymentController from '../../controllers/payment.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { paymentInitSchema } from '../../utils/validators';
import { paymentLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();

// Payment initialization (can be guest or authenticated)
router.post('/initialize', optionalAuth, paymentLimiter, validate(paymentInitSchema), paymentController.initializePayment);

// Payment verification
router.post('/verify/:reference', paymentController.verifyPayment);

// Webhook (no auth required, verified by signature)
router.post('/webhook', paymentController.handleWebhook);

// Transaction management (protected)
router.get('/transaction/:id', authenticate, paymentController.getTransaction);
router.post('/refund/:id', authenticate, paymentController.processRefund);

export default router;
