import { Router } from 'express';
import contactController from '../../controllers/contact.controller';

const router = Router();

/**
 * Contact Routes
 * Public endpoints - no authentication required
 */

// POST /api/v1/contact/submit - Submit contact form
router.post('/submit', contactController.submitContactForm);

export default router;
