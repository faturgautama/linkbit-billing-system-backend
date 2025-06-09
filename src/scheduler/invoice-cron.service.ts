import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class InvoiceCronService {
    constructor(
        private _prismaService: PrismaService,
    ) { }

    @Cron(process.env.CRONJOB_GENERATE_INVOICE, { timeZone: 'Asia/Jakarta', name: 'generate_invoice' })
    async generateInvoices() {
        console.log("Starting cron generate invoice.....")

        const today = new Date();
        const companies = await this._prismaService.setting_company.findMany({
            where: { is_active: true },
        });

        for (const company of companies) {
            const customers = await this._prismaService.pelanggan.findMany({
                where: {
                    is_active: true,
                    id_setting_company: company.id_setting_company,
                },
                include: { pelanggan_product: true },
            });

            for (const customer of customers) {
                for (const product of customer.pelanggan_product) {
                    const existingInvoice = await this._prismaService.invoice.findFirst({
                        where: {
                            id_pelanggan: customer.id_pelanggan,
                            id_product: product.id_product,
                            invoice_date: {
                                gte: new Date(today.getFullYear(), today.getMonth(), 1),
                                lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
                            },
                            is_deleted: false,
                        },
                    });

                    if (!existingInvoice) {
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = now.getMonth();
                        const startDate = new Date(year, month, 1);
                        const endDate = new Date(year, month + 1, 1);
                        const invoiceMonthCount = await this._prismaService.invoice.count({
                            where: {
                                invoice_date: { gt: startDate, lt: endDate },
                            },
                        });

                        const paddedCount = String(invoiceMonthCount + 1).padStart(4, '0');
                        const maxDay = new Date(year, month + 1, 0).getDate();
                        const dueDay = Math.min(company.tagihan_jatuh_tempo, maxDay);
                        const due_date = new Date(year, month + 1, dueDay);

                        await this._prismaService.invoice.create({
                            data: {
                                invoice_date: now,
                                invoice_number: `INV-${product.id_pelanggan}-${String(month + 1).padStart(2, '0')}${year}-${paddedCount}`,
                                id_pelanggan: product.id_pelanggan,
                                id_pelanggan_product: product.id_pelanggan_product,
                                id_product: product.id_product,
                                price: product.price,
                                diskon_percentage: 0,
                                diskon_rupiah: 0,
                                pajak: 0,
                                admin_fee: 0,
                                unique_code: "-",
                                total: product.price,
                                due_date: due_date,
                                invoice_status: 'PENDING',
                                create_at: now,
                                create_by: 9999,
                            },
                        });
                    }
                }
            }
        }
    }
}