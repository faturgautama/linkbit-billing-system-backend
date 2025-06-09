import { Injectable, Scope } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosService } from 'src/helper/utility/axios.service';
import { UtilityService } from 'src/helper/utility/utility.service';
import { WhatsappChannelProviderModel } from '../channel-provider.model';

@Injectable()
export class LinkbitWapService {

    constructor(
        private _axiosService: AxiosService,
        private _utilityService: UtilityService,
    ) { }

    async handleSendMessage(type: string, invoice: any, channel_whatsapp: any) {
        return type == 'INVOICE'
            ? await this.sendInvoiceMessage(invoice, channel_whatsapp)
            : await this.sendPaymentMessage(invoice, channel_whatsapp);
    }

    private async sendInvoiceMessage(invoice: any, channel_whatsapp: any): Promise<any> {
        try {
            const token = this._utilityService.onEncrypt(JSON.stringify(invoice.id_invoice));

            const messageVariable = {
                full_name: invoice.pelanggan.full_name,
                pelanggan_code: invoice.pelanggan.pelanggan_code,
                product_name: invoice.product.product_name,
                invoice_date: this._utilityService.onFormatDate(new Date(invoice.invoice_date), 'MMM yyyy'),
                invoice_number: invoice.invoice_number,
                total: this._utilityService.onFormatCurrency(invoice.total),
                checkout_url: `${process.env.CHECKOUT_URL}?token=${token}`,
                invoice_digital_url: `${process.env.INVOICE_DIGITAL_URL}?token=${token}`,
            };

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
                url: `${channel_whatsapp.api_url}/send-message`,
                params: {
                    api_key: invoice.pelanggan.setting_company.api_key_wa,
                    sender: invoice.pelanggan.setting_company.company_whatsapp,
                    number: invoice.pelanggan.whatsapp,
                    message: messageText,
                }
            };

            return await firstValueFrom(this._axiosService.onAxiosRequest(payloadSendMessageMpwa));
        } catch (error) {
            console.log("error sendInvoiceMessage linkbit wap =>", error);
            throw error;
        }
    }

    private async sendPaymentMessage(invoice: any, channel_whatsapp: any): Promise<any> {
        try {
            const token = this._utilityService.onEncrypt(JSON.stringify(invoice.id_invoice));

            const messageVariable = {
                full_name: invoice.pelanggan.full_name,
                pelanggan_code: invoice.pelanggan.pelanggan_code,
                product_name: invoice.product.product_name,
                invoice_date: this._utilityService.onFormatDate(new Date(invoice.invoice_date), 'MMM yyyy'),
                invoice_number: invoice.invoice_number,
                total: this._utilityService.onFormatCurrency(invoice.total),
                invoice_digital_url: `${process.env.INVOICE_DIGITAL_URL}?token=${token}`,
            };

            const template = invoice.pelanggan.setting_company.tagihan_pesan_lunas;
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
                url: `${channel_whatsapp.api_url}/send-message`,
                params: {
                    api_key: invoice.pelanggan.setting_company.api_key_wa,
                    sender: invoice.pelanggan.setting_company.company_whatsapp,
                    number: invoice.pelanggan.whatsapp,
                    message: messageText,
                }
            };

            return await firstValueFrom(this._axiosService.onAxiosRequest(payloadSendMessageMpwa));
        } catch (error) {
            console.log("error sendPaymentMessage linkbit wap =>", error);
            throw error;
        }
    }
}
