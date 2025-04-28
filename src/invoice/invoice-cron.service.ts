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

    // Cron job to run on the 5th of each month at 07:00 WIB
    // @Cron('0 0 7 5 * *', {
    //     timeZone: 'Asia/Jakarta',
    // })
    @Cron('0 0 14 28 4 *', {
        timeZone: 'Asia/Jakarta',
    })
    async handleSendWhatsappJob() {
        console.log('Running job to create invoices and send WhatsApp messages.');

        // Step 1: Automatically create invoices for all customers
        const pelangganProduct = await this._prismaService.pelanggan_product.findMany({
            where: {
                is_active: true,
            },
            include: {
                pelanggan: {
                    include: {
                        setting_company: true
                    }
                }
            }
        });

        console.log("pelanggan product =>", JSON.stringify(pelangganProduct));

        for (const product of pelangganProduct) {
            const invoice_date = new Date();
            const year = invoice_date.getFullYear();
            const month = invoice_date.getMonth() + 1;
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 1);
            const setting_company = await this._prismaService.setting_company.findFirst({
                where: {
                    id_setting_company: parseInt(product.pelanggan.setting_company.id_setting_company as any)
                },
                select: {
                    tagihan_jatuh_tempo: true
                }
            });
            const bulanJatuhTempo = invoice_date.getMonth() + 2;
            const due_date = new Date(year, bulanJatuhTempo - 1, setting_company.tagihan_jatuh_tempo, 0, 0, 0);
            const invoiceMonthCount = await this._prismaService
                .invoice
                .count({
                    where: {
                        invoice_date: {
                            gt: startDate,
                            lt: endDate,
                        }
                    }
                });
            const prefix = invoiceMonthCount < 10 ? '000' :
                (invoiceMonthCount < 100 ? '00' :
                    (invoiceMonthCount < 1000 ? '0' : '')
                );
            const invoicePayload = {
                invoice_date: new Date(), // set your desired invoice date here
                invoice_number: `INV-${product.id_pelanggan}-${month > 9 ? month : `0${month}`}${year}-${prefix}${invoiceMonthCount + 1}`, // set your desired invoice date here
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
                create_at: new Date(),
                create_by: 9999,
            };

            console.log("invoice payload cron =>", invoicePayload);

            // Create invoice for each customer
            const createdInvoice = await this.createInvoice(invoicePayload);

            console.log("result invoice cron =>", createdInvoice);

            // Step 2: Send WhatsApp messages for each created invoice
            if (createdInvoice) {
                await this.sendPendingWhatsappMessages(createdInvoice.id_invoice);
            }
        }
    }

    async createInvoice(payload: any): Promise<any> {
        try {
            const invoice = await this._prismaService.invoice.create({
                data: payload,
            });

            return invoice;
        } catch (error) {
            console.error('Error creating invoice:', error);
            return null;
        }
    }

    async sendPendingWhatsappMessages(id_invoice: number) {
        await this._invoiceService.sendMessage(id_invoice);
        await this.sleep(20000); // wait 20 seconds before next message
    }

    @Cron('0 * * * *') // Every minute
    async testCron() {
        console.log('Test cron running');

        const pendingInvoices = await this._prismaService.invoice.findMany({
            where: {
                invoice_status: 'PENDING',
            },
        });

        console.log('Pending invoices:', pendingInvoices.length);
    }
}
