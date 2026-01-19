import type { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Content Controller
 * Handles dynamic content for Services, About, and Help pages
 */

// GET /api/v1/content/services
export const getServices = async (_req: Request, res: Response) => {
    try {
        const services = await prisma.service.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });

        // Parse JSON features string back to array
        const parsedServices = services.map(service => ({
            ...service,
            features: JSON.parse(service.features),
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
        const sections = await prisma.aboutSection.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });

        // Parse JSON items string back to array
        const parsedSections = sections.map(section => ({
            ...section,
            items: section.items ? JSON.parse(section.items) : null,
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

        const faqs = await prisma.fAQ.findMany({
            where: {
                isActive: true,
                ...(category && { category: category as string }),
            },
            orderBy: { order: 'asc' },
        });

        return res.json({
            success: true,
            data: faqs,
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
        const categories = await prisma.helpCategory.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });

        return res.json({
            success: true,
            data: categories,
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
