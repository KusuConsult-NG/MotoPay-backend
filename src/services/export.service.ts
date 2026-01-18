import prisma from '../config/database';
import { createObjectCsvStringifier } from 'csv-writer';

export class ExportService {
    async exportTransactionsCSV(filters: {
        startDate?: Date;
        endDate?: Date;
        status?: string;
        channel?: string;
    }) {
        const where: any = {};

        if (filters.status) where.status = filters.status;
        if (filters.channel) where.channel = filters.channel;
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = filters.startDate;
            if (filters.endDate) where.createdAt.lte = filters.endDate;
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                vehicle: true,
                user: {
                    select: { fullName: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'reference', title: 'Reference' },
                { id: 'date', title: 'Date' },
                { id: 'plateNumber', title: 'Plate Number' },
                { id: 'ownerName', title: 'Owner Name' },
                { id: 'amount', title: 'Amount' },
                { id: 'fee', title: 'Fee' },
                { id: 'totalAmount', title: 'Total Amount' },
                { id: 'status', title: 'Status' },
                { id: 'channel', title: 'Channel' },
                { id: 'paymentMethod', title: 'Payment Method' },
            ],
        });

        const records = transactions.map((t: any) => ({
            reference: t.reference,
            date: new Date(t.createdAt).toLocaleDateString(),
            plateNumber: t.vehicle.plateNumber,
            ownerName: t.vehicle.ownerName,
            amount: Number(t.amount),
            fee: Number(t.fee),
            totalAmount: Number(t.totalAmount),
            status: t.status,
            channel: t.channel,
            paymentMethod: t.paymentMethod,
        }));

        const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
        return csv;
    }

    async exportVehiclesCSV() {
        const vehicles = await prisma.vehicle.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'plateNumber', title: 'Plate Number' },
                { id: 'chassisNumber', title: 'Chassis Number' },
                { id: 'make', title: 'Make' },
                { id: 'model', title: 'Model' },
                { id: 'year', title: 'Year' },
                { id: 'vehicleType', title: 'Type' },
                { id: 'ownerName', title: 'Owner Name' },
                { id: 'ownerContact', title: 'Owner Contact' },
                { id: 'status', title: 'Status' },
                { id: 'registrationDate', title: 'Registration Date' },
            ],
        });

        const records = vehicles.map((v: any) => ({
            plateNumber: v.plateNumber,
            chassisNumber: v.chassisNumber,
            make: v.make,
            model: v.model,
            year: v.year,
            vehicleType: v.vehicleType,
            ownerName: v.ownerName,
            ownerContact: v.ownerContact,
            status: v.status,
            registrationDate: new Date(v.registrationDate).toLocaleDateString(),
        }));

        const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
        return csv;
    }

    async exportAgentCommissionsCSV(agentId: string, startDate?: Date, endDate?: Date) {
        const where: any = { agentId };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        const commissions = await prisma.agentCommission.findMany({
            where,
            include: {
                transaction: {
                    include: {
                        vehicle: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'date', title: 'Date' },
                { id: 'transactionRef', title: 'Transaction Reference' },
                { id: 'plateNumber', title: 'Plate Number' },
                { id: 'transactionAmount', title: 'Transaction Amount' },
                { id: 'percentage', title: 'Commission %' },
                { id: 'amount', title: 'Commission Amount' },
                { id: 'status', title: 'Status' },
                { id: 'paidDate', title: 'Paid Date' },
            ],
        });

        const records = commissions.map((c: any) => ({
            date: new Date(c.createdAt).toLocaleDateString(),
            transactionRef: c.transaction.reference,
            plateNumber: c.transaction.vehicle.plateNumber,
            transactionAmount: Number(c.transaction.amount),
            percentage: Number(c.percentage),
            amount: Number(c.amount),
            status: c.status,
            paidDate: c.paidAt ? new Date(c.paidAt).toLocaleDateString() : 'N/A',
        }));

        const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
        return csv;
    }
}

export default new ExportService();
