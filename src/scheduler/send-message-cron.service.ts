import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { firstValueFrom } from 'rxjs';
import { AxiosService } from 'src/helper/utility/axios.service';
import { UtilityService } from 'src/helper/utility/utility.service';
import { ChannelProviderRouterService } from 'src/helper/services/channel-whatsapp-provider/channel-provider-router.service';

@Injectable()
export class SendMessageCronService {
    private sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    constructor(
        private _axiosService: AxiosService,
        private _prismaService: PrismaService,
        private _utilityService: UtilityService,
        private _channelProviderRouterService: ChannelProviderRouterService,
    ) { }

    @Cron(process.env.CRONJOB_SEND_MESSAGE, { timeZone: 'Asia/Jakarta', name: 'send_invoice_notifications' })
    async sendInvoiceNotifications() {
        console.log("Starting cron sending message.....");
        console.log("Starting at : ", new Date());

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-based

        // Rentang waktu: 4 tanggal bulan ini (00:00:00) s.d. 5 tanggal bulan ini (00:00:00)
        const start = new Date(year, month, 1, 0, 0, 0);
        const end = new Date(year, month, 6, 0, 0, 0);

        const invoices = await this._prismaService.invoice.findMany({
            where: {
                invoice_date: {
                    gte: start,
                    lt: end,
                },
                is_deleted: false,
                invoice_status: 'PENDING',
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

        console.log("total invoice =>", invoices.length);

        for (const invoice of invoices) {
            console.log("invoice =>", invoice);
            const req: any = {
                user: {
                    id_setting_company: invoice.pelanggan.id_setting_company
                }
            }
            await this._channelProviderRouterService.handleSendMessage(req, 'INVOICE', invoice);
            await this.sleep(20000); // tunggu 20 detik
        }
    }
}
