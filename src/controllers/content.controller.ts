import type { Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';

// Initialize SQLite database
const dbPath = path.join(__dirname, '../../prisma/dev.db');
const db = new Database(dbPath);

/**
 * Content Controller
 * Handles dynamic content for Services, About, and Help pages
 * Uses raw SQL queries to bypass Prisma client generation issues
 */

// GET /api/v1/content/services
export const getServices = async (_req: Request, res: Response) => {
    try {
        const services = db.prepare(`
            SELECT * FROM services 
            WHERE isActive = 1 
            ORDER BY "order" ASC
        `).all();

        // Parse JSON features string back to array
        const parsedServices = services.map((service: any) => ({
            ...service,
            features: JSON.parse(service.features),
            isActive: Boolean(service.isActive),
        }));

        return res.json({
            success: true,
            data: parsedServices,
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch services',
        });
    }
};

// GET /api/v1/content/about
export const getAboutSections = async (_req: Request, res: Response) => {
    try {
        const sections = db.prepare(`
            SELECT * FROM about_sections 
            WHERE isActive = 1 
            ORDER BY "order" ASC
        `).all();

        // Parse JSON items string back to array
        const parsedSections = sections.map((section: any) => ({
            ...section,
            items: section.items ? JSON.parse(section.items) : null,
            isActive: Boolean(section.isActive),
        }));

        return res.json({
            success: true,
            data: parsedSections,
        });
    } catch (error) {
        console.error('Error fetching about sections:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch about sections',
        });
    }
};

// GET /api/v1/content/faqs
export const getFAQs = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        let faqs;
        if (category) {
            faqs = db.prepare(`
                SELECT * FROM faqs 
                WHERE isActive = 1 AND category = ?
                ORDER BY "order" ASC
            `).all(category);
        } else {
            faqs = db.prepare(`
                SELECT * FROM faqs 
                WHERE isActive = 1 
                ORDER BY "order" ASC
            `).all();
        }

        // Convert isActive to boolean
        const parsedFaqs = faqs.map((faq: any) => ({
            ...faq,
            isActive: Boolean(faq.isActive),
        }));

        return res.json({
            success: true,
            data: parsedFaqs,
        });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch FAQs',
        });
    }
};

// GET /api/v1/content/help-categories
export const getHelpCategories = async (_req: Request, res: Response) => {
    try {
        const categories = db.prepare(`
            SELECT * FROM help_categories 
            WHERE isActive = 1 
            ORDER BY "order" ASC
        `).all();

        // Convert isActive to boolean
        const parsedCategories = categories.map((category: any) => ({
            ...category,
            isActive: Boolean(category.isActive),
        }));

        return res.json({
            success: true,
            data: parsedCategories,
        });
    } catch (error) {
        console.error('Error fetching help categories:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch help categories',
        });
    }
};

export default {
    getServices,
    getAboutSections,
    getFAQs,
    getHelpCategories,
};
