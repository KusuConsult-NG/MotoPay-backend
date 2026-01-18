import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { join } from 'path';
import prisma from '../config/database';
import { AppError, formatCurrency } from '../utils/helpers';
import logger from '../config/logger';

export class PDFService {
    private uploadsDir = join(process.cwd(), 'uploads', 'receipts');

    async generateReceipt(transactionId: string): Promise<string> {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                vehicle: true,
                user: true,
                receipt: true,
            },
        });

        if (!transaction) {
            throw new AppError(404, 'Transaction not found');
        }

        if (!transaction.receipt) {
            throw new AppError(404, 'Receipt not found');
        }

        const fileName = `${transaction.receipt.receiptNumber}.pdf`;
        const filePath = join(this.uploadsDir, fileName);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const stream = createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc
                .fontSize(20)
                .text('PLATEAU STATE INTERNAL REVENUE SERVICE', { align: 'center' })
                .fontSize(16)
                .text('MotoPay - Vehicle Levy Payment Receipt', { align: 'center' })
                .moveDown();

            // Receipt Number
            doc
                .fontSize(12)
                .text(`Receipt No: ${transaction.receipt.receiptNumber}`, { align: 'right' })
                .text(`Date: ${new Date(transaction.createdAt).toLocaleDateString()}`, { align: 'right' })
                .moveDown();

            // Separator
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

            // Transaction Details
            doc.fontSize(14).text('Transaction Details', { underline: true }).moveDown(0.5);

            const details = [
                ['Transaction Reference:', transaction.reference],
                ['Vehicle Plate Number:', transaction.vehicle.plateNumber],
                ['Vehicle Make/Model:', `${transaction.vehicle.make} ${transaction.vehicle.model}`],
                ['Vehicle Owner:', transaction.vehicle.ownerName],
                ['Payment Method:', transaction.paymentMethod],
                ['Payment Status:', transaction.status],
            ];

            details.forEach(([label, value]) => {
                doc
                    .fontSize(11)
                    .text(label, 50, doc.y, { continued: true, width: 200 })
                    .text(value, { width: 300 });
            });

            doc.moveDown();

            // Amount Details
            doc.fontSize(14).text('Payment Breakdown', { underline: true }).moveDown(0.5);

            doc
                .fontSize(11)
                .text('Amount:', 50, doc.y, { continued: true, width: 200 })
                .text(formatCurrency(Number(transaction.amount)), { width: 300 });

            doc
                .text('Processing Fee:', 50, doc.y, { continued: true, width: 200 })
                .text(formatCurrency(Number(transaction.fee)), { width: 300 });

            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('Total Amount Paid:', 50, doc.y + 10, { continued: true, width: 200 })
                .text(formatCurrency(Number(transaction.totalAmount)), { width: 300 });

            doc.font('Helvetica').moveDown(2);

            // Compliance Items
            if (transaction.metadata && (transaction.metadata as any).complianceItems) {
                doc.fontSize(14).text('Compliance Items', { underline: true }).moveDown(0.5);

                const items = (transaction.metadata as any).complianceItems;
                items.forEach((item: any) => {
                    doc
                        .fontSize(10)
                        .text(`• ${item.name}`, 70)
                        .text(`  Amount: ${formatCurrency(item.price)}`, 70);
                });

                doc.moveDown();
            }

            // Footer
            doc
                .fontSize(10)
                .text('This is a computer-generated receipt and does not require a signature.', 50, 700, {
                    align: 'center',
                    width: 500,
                })
                .text('For inquiries, contact: support@motopay.pl.gov.ng', { align: 'center' })
                .text('Website: www.motopay.pl.gov.ng', { align: 'center' });

            // Finalize
            doc.end();

            stream.on('finish', () => {
                logger.info(`Receipt PDF generated: ${fileName}`);
                resolve(filePath);
            });

            stream.on('error', (error) => {
                logger.error('PDF generation error:', error);
                reject(error);
            });
        });
    }

    async generateComplianceReport(vehicleId: string): Promise<string> {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
            include: {
                compliance: {
                    include: {
                        complianceItem: true,
                    },
                },
            },
        });

        if (!vehicle) {
            throw new AppError(404, 'Vehicle not found');
        }

        const fileName = `compliance-${vehicle.plateNumber}-${Date.now()}.pdf`;
        const filePath = join(this.uploadsDir, fileName);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const stream = createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc
                .fontSize(20)
                .text('VEHICLE COMPLIANCE REPORT', { align: 'center' })
                .fontSize(12)
                .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' })
                .moveDown(2);

            // Vehicle Info
            doc.fontSize(14).text('Vehicle Information', { underline: true }).moveDown(0.5);

            doc
                .fontSize(11)
                .text(`Plate Number: ${vehicle.plateNumber}`)
                .text(`Make/Model: ${vehicle.make} ${vehicle.model} (${vehicle.year})`)
                .text(`Owner: ${vehicle.ownerName}`)
                .text(`Type: ${vehicle.vehicleType}`)
                .moveDown();

            // Compliance Status
            doc.fontSize(14).text('Compliance Status', { underline: true }).moveDown(0.5);

            const now = new Date();
            vehicle.compliance.forEach((comp) => {
                const isActive = new Date(comp.expiryDate) > now && comp.status === 'ACTIVE';

                doc
                    .fontSize(11)
                    .text(`• ${comp.complianceItem.name}`)
                    .text(`  Status: ${isActive ? 'ACTIVE ✓' : 'EXPIRED ✗'}`, 70)
                    .text(`  Expiry: ${new Date(comp.expiryDate).toLocaleDateString()}`, 70)
                    .moveDown(0.5);
            });

            doc.end();

            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }
}

export default new PDFService();
