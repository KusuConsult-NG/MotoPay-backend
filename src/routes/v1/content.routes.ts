import { Router } from 'express';
import contentController from '../../controllers/content.controller';

const router = Router();

/**
 * Content Routes
 * Public endpoints for dynamic page content
 */

// GET /api/v1/content/services - Get all services
router.get('/services', contentController.getServices);

// GET /api/v1/content/about - Get about sections
router.get('/about', contentController.getAboutSections);

// GET /api/v1/content/faqs - Get FAQs (optional category query param)
router.get('/faqs', contentController.getFAQs);

// GET /api/v1/content/help-categories - Get help categories
router.get('/help-categories', contentController.getHelpCategories);

export default router;
