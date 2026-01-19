import type { Request, Response } from 'express';

/**
 * Contact Form Controller
 * Handles contact form submissions
 */

export const submitContactForm = async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate input
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        // Log the contact form submission
        console.log('📧 Contact Form Submission:', {
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString(),
        });

        // TODO: Future enhancements:
        // 1. Send email notification to support team
        // 2. Store in database for tracking
        // 3. Send auto-reply to user

        // For now, we just log it and return success
        return res.status(200).json({
            success: true,
            message: 'Thank you for contacting us! We will get back to you soon.',
        });
    } catch (error) {
        console.error('Contact form error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit contact form. Please try again later.'
        });
    }
};

export default {
    submitContactForm,
};
