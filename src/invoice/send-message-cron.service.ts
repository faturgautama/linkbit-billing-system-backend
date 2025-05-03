import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { InvoiceService } from './invoice.service';

@Injectable()
export class SendMessageCronService {
    private sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    constructor(
        private _prismaService: PrismaService,
        private _invoiceService: InvoiceService,
    ) { }

    @Cron('0 0 19 3 5 *', { timeZone: 'Asia/Jakarta' })
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
        });

        for (const invoice of invoices) {
            await this._invoiceService.sendMessage(invoice.id_invoice);
            await this.sleep(20000); // tunggu 20 detik
        }
    }

}
