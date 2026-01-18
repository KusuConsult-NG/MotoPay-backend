import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Ensure upload directories exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const receiptsDir = path.join(uploadsDir, 'receipts');
const documentsDir = path.join(uploadsDir, 'documents');
const evidenceDir = path.join(uploadsDir, 'evidence');

[uploadsDir, receiptsDir, documentsDir, evidenceDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage configuration
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const uploadType = (req.body.uploadType || 'documents') as string;
        let dest = documentsDir;

        if (uploadType === 'evidence') {
            dest = evidenceDir;
        } else if (uploadType === 'receipt') {
            dest = receiptsDir;
        }

        cb(null, dest);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, PNG) and documents (PDF, DOC, DOCX) are allowed'));
    }
};

// Multer instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string = 'file') => {
    return upload.single(fieldName);
};

// Middleware for multiple file uploads
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 5) => {
    return upload.array(fieldName, maxCount);
};

// Helper to get file URL
export const getFileUrl = (filename: string, type: 'receipt' | 'document' | 'evidence' = 'document'): string => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${type}s/${filename}`;
};

// Helper to delete file
export const deleteFile = (filePath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};
