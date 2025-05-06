import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { firstValueFrom } from 'rxjs';
import { AxiosService } from 'src/helper/utility/axios.service';
import { UtilityService } from 'src/helper/utility/utility.service';

@Injectable()
export class SendMessageCronService {
    private sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    constructor(
        private _axiosService: AxiosService,
        private _prismaService: PrismaService,
        private _utilityService: UtilityService,
    ) { }

    @Cron('* 25 21 6 * *', { timeZone: 'Asia/Jakarta', name: 'send_invoice_notifications' })
    async sendInvoiceNotifications() {
        console.log("Starting cron sending message.....")

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-based

        // Rentang waktu: 4 tanggal bulan ini (00:00:00) s.d. 5 tanggal bulan ini (00:00:00)
        const start = new Date(year, month, 1, 0, 0, 0);
        const end = new Date(year, month, 5, 0, 0, 0);

        const invoices = await this._prismaService.invoice.findMany({
            where: {
                invoice_date: {
                    gte: start,
                    lt: end,
                },
                is_deleted: false,
            },
            include: {
                pelanggan: {
                    include: {
                        setting_company: true
                    }
                },
                product: true,
            }
        });

        for (const invoice of invoices) {
            // await this.sendMessage(invoice);
            console.log("sending invoice to =>", invoice.pelanggan.full_name);
            await this.sleep(20000); // tunggu 20 detik
        }
    }

    async sendMessage(invoice: any): Promise<any> {
        if (!invoice.pelanggan.setting_company.api_key_wa) {
            return {
                status: false,
                message: "API Key WA belum diatur"
            }
        };

        const token = this._utilityService.onEncrypt(JSON.stringify(invoice.id_invoice));

        const messageVariable = {
            full_name: invoice.pelanggan.full_name,
            pelanggan_code: invoice.pelanggan.pelanggan_code,
            product_name: invoice.product.product_name,
            invoice_date: this._utilityService.onFormatDate(new Date(invoice.invoice_date), 'MMM yyyy'),
            invoice_number: invoice.invoice_number,
            total: this._utilityService.onFormatCurrency(invoice.total),
            checkout_url: `${process.env.CHECKOUT_URL}?token=${token}`,
        }

        const template = invoice.pelanggan.setting_company.tagihan_pesan_invoice;
        const newTemplate = template.replace(/\${(.*?)}/g, (_, key) => messageVariable[key.trim()] || "");
        const messageText = newTemplate
            .replace(/<\/p>\s*<p>/g, '\n') // Replace consecutive <p> tags with a single line break
            .replace(/<\/?[^>]+(>|$)/g, "") // Remove any remaining HTML tags
            .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces with normal spaces
            .replace(/&gt;/g, '>') // Replace `&gt;` with `>`
            .replace(/&lt;/g, '<') // Replace `&lt;` with `<`
            .replace(/&amp;/g, '&') // Replace `&amp;` with `&`
            .trim(); // Remove any leading or trailing spaces

        const payloadSendMessageMpwa = {
            method: 'get',
            url: `${process.env.MPWA_URL}/send-message`,
            params: {
                api_key: invoice.pelanggan.setting_company.api_key_wa,
                sender: invoice.pelanggan.setting_company.company_whatsapp,
                number: invoice.pelanggan.whatsapp,
                message: messageText,
            }
        };

        const mpwaSendMessageResult = await firstValueFrom(this._axiosService.onAxiosRequest(payloadSendMessageMpwa));

        console.log("result send wa =>", mpwaSendMessageResult);

        if (!mpwaSendMessageResult.status) {
            await this._prismaService
                .log_whatsapp_message
                .create({
                    data: {
                        id_invoice: invoice.id_invoice,
                        id_setting_company: invoice.pelanggan.id_setting_company,
                        additional_info: invoice,
                        sent_at: new Date(),
                        sent_by: invoice.create_by,
                        status: 'FAILED'
                    }
                });
        } else {
            await this._prismaService
                .log_whatsapp_message
                .create({
                    data: {
                        id_invoice: invoice.id_invoice,
                        id_setting_company: invoice.pelanggan.id_setting_company,
                        additional_info: invoice,
                        sent_at: new Date(),
                        sent_by: invoice.create_by,
                        status: 'SUCCESS'
                    }
                });
        }
    }
}
