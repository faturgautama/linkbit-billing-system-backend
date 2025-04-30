import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { SettingCompanyService } from 'src/setting-company/setting-company.service';
import { AxiosService } from 'src/utility/axios.service';
import { UtilityService } from 'src/utility/utility.service';
import { InvoiceService } from './invoice.service';

@Injectable()
export class InvoiceCronService {
    private sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    constructor(
        private _axiosService: AxiosService,
        private _prismaService: PrismaService,
        private _utilityService: UtilityService,
        private _invoiceService: InvoiceService,
        private _settingCompanyService: SettingCompanyService,
    ) { }

    @Cron('0 0 0 * * *', { timeZone: 'Asia/Jakarta' }) // Setiap hari jam 07:00 WIB
    async handleDailyTagihanCheck() {
        const today = new Date();
        const currentDate = today.getDate(); // ambil tanggal (1 - 31)

        const companies = await this._prismaService.setting_company.findMany({
            where: {
                is_active: true,
                tagihan_jatuh_tempo: currentDate,
            },
        });

        for (const company of companies) {
            // Lewati jika hari ini masih sebelum tagihan_jatuh_tempo
            if (currentDate <= company.tagihan_jatuh_tempo) {
                const customers = await this._prismaService.pelanggan.findMany({
                    where: {
                        is_active: true,
                        id_setting_company: company.id_setting_company,
                    },
                    include: {
                        pelanggan_product: true,
                    },
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

                        let id_invoice = existingInvoice?.id_invoice;

                        if (!existingInvoice) {
                            const now = new Date();
                            const year = now.getFullYear();
                            const month = now.getMonth(); // 0-based
                            const startDate = new Date(year, month, 1);
                            const endDate = new Date(year, month + 1, 1);
                            const invoiceMonthCount = await this._prismaService.invoice.count({
                                where: {
                                    invoice_date: {
                                        gt: startDate,
                                        lt: endDate,
                                    },
                                },
                            });

                            const paddedCount = String(invoiceMonthCount + 1).padStart(4, '0');
                            const maxDay = new Date(year, month + 1, 0).getDate();
                            const dueDay = Math.min(company.tagihan_jatuh_tempo, maxDay);
                            const due_date = new Date(year, month + 1, dueDay); // jatuh tempo bulan depan

                            const createdInvoice = await this._prismaService.invoice.create({
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

                            id_invoice = createdInvoice.id_invoice;
                        }

                        // Kirim WA
                        await this._invoiceService.sendMessage(id_invoice);
                        await this.sleep(20000); // tunggu 20 detik sebelum kirim berikutnya
                    }
                };
            }

            // Validasi: apakah tagihan_jatuh_tempo valid di bulan ini?
            const maxDayThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            if (company.tagihan_jatuh_tempo > maxDayThisMonth) {
                console.warn(`Lewati ${company.company_name} karena tagihan_jatuh_tempo (${company.tagihan_jatuh_tempo}) melebihi jumlah hari di bulan ini (${maxDayThisMonth}).`);
                continue;
            }
        }
    }
}