import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosService } from 'src/helper/utility/axios.service';
import { UtilityService } from 'src/helper/utility/utility.service';
import * as crypto from 'crypto';
import * as url from 'url';

@Injectable()
export class QontakWapService {
  constructor(
    private _axiosService: AxiosService,
    private _utilityService: UtilityService,
  ) {}

  async handleSendMessage(type: string, invoice: any, channel_whatsapp: any) {
    return await this.getListTemplate(type, invoice, channel_whatsapp);
  }

  private generateHeader(method: string, path: string, channel_whatsapp: any) {
    const requestUrl = url.parse(path);
    const datetime = new Date().toUTCString();
    const requestLine = `${method.toUpperCase()} ${requestUrl.path} HTTP/1.1`;
    const payload = [`date: ${datetime}`, requestLine].join('\n');

    // Generate the signature
    const signature = crypto
      .createHmac('sha256', channel_whatsapp.credential.client_secret)
      .update(payload)
      .digest('base64');

    // Build Authorization header string
    const hmacHeader = `hmac username="${channel_whatsapp.credential.client_id}", algorithm="hmac-sha256", headers="date request-line", signature="${signature}"`;

    // Now set headers
    const headers = {
      'Content-Type': 'application/json',
      Date: datetime,
      Authorization: hmacHeader,
    };

    return headers;
  }

  private async getListTemplate(
    type: string,
    invoice: any,
    channel_whatsapp: any,
  ) {
    try {
      const method = 'get';
      const url = `${channel_whatsapp.channel_whatsapp.api_url}/templates/whatsapp`;
      const headers = this.generateHeader(method, url, channel_whatsapp);

      const payload_get_list_template = {
        method: method,
        url: url,
        headers: headers,
      };

      const templates = await firstValueFrom(
        this._axiosService.onAxiosRequest(payload_get_list_template),
      );

      if (!templates.status) {
        return {
          status: false,
          message: templates.message,
        };
      }

      let template_name =
        type == 'INVOICE'
          ? process.env.QONTAK_TEMPLATE_INVOICE_XENDIT
          : type == 'PAYMENT'
          ? process.env.QONTAK_TEMPLATE_PEMBAYARAN
          : process.env.QONTAK_TEMPLATE_INVOICE_MANUAL;

      const payload_info = {
        method: 'post',
        url: `${channel_whatsapp.channel_whatsapp.api_url}/broadcasts/whatsapp/direct`,
        message_template_id: templates.data.data.find(
          (item) => item.name == template_name,
        ).id,
        message_variable: {
          full_name: invoice.pelanggan.full_name,
          pelanggan_code: invoice.pelanggan.pelanggan_code,
          product_name: invoice.product.product_name,
          invoice_date: this._utilityService.onFormatDate(
            new Date(invoice.invoice_date),
            'MMM yyyy',
          ),
          invoice_number: invoice.invoice_number,
          due_date: invoice.pelanggan.setting_company.tagihan_jatuh_tempo,
          total: this._utilityService.onFormatCurrency(invoice.total),
          checkout_url: `${
            process.env.CHECKOUT_URL
          }?token=${this._utilityService.onEncrypt(
            JSON.stringify(invoice.id_invoice),
          )}`,
          invoice_digital_url: `${
            process.env.INVOICE_DIGITAL_URL
          }?token=${this._utilityService.onEncrypt(
            JSON.stringify(invoice.id_invoice),
          )}`,
        },
      };

      return template_name == process.env.QONTAK_TEMPLATE_INVOICE_XENDIT
        ? await this.sendMessageInvoiceXendit(
            invoice,
            payload_info,
            channel_whatsapp,
          )
        : template_name == process.env.QONTAK_TEMPLATE_PEMBAYARAN
        ? await this.sendMessagePembayaran(
            invoice,
            payload_info,
            channel_whatsapp,
          )
        : await this.sendMessageInvoiceManual(
            invoice,
            payload_info,
            channel_whatsapp,
          );
    } catch (error) {
      throw error;
    }
  }

  private async sendMessageInvoiceXendit(
    invoice: any,
    payload_info: any,
    channel_whatsapp: any,
  ) {
    try {
      const send_message_payload = {
        method: payload_info.method,
        url: payload_info.url,
        headers: this.generateHeader(
          payload_info.method,
          payload_info.url,
          channel_whatsapp,
        ),
        data: {
          to_name: invoice.pelanggan.full_name,
          to_number: invoice.pelanggan.whatsapp,
          message_template_id: payload_info.message_template_id,
          channel_integration_id: process.env.QONTAK_CHANNEL_INTEGRATION_ID,
          language: {
            code: 'id',
          },
          parameters: {
            buttons: [
              {
                index: '0',
                type: 'URL',
                value: payload_info.message_variable.checkout_url.replace(
                  'https://checkout.linkbit.net.id',
                  '',
                ),
              },
            ],
            body: [
              {
                key: '1',
                value: 'customer_name',
                value_text: payload_info.message_variable.full_name,
              },
              {
                key: '2',
                value: 'pelanggan_code',
                value_text: payload_info.message_variable.pelanggan_code,
              },
              {
                key: '3',
                value: 'product_name',
                value_text: payload_info.message_variable.product_name,
              },
              {
                key: '4',
                value: 'periode',
                value_text: payload_info.message_variable.invoice_date,
              },
              {
                key: '5',
                value: 'total',
                value_text: payload_info.message_variable.total,
              },
              {
                key: '6',
                value: 'due_date',
                value_text: payload_info.message_variable.due_date,
              },
              {
                key: '7',
                value: 'invoice_url',
                value_text: payload_info.message_variable.invoice_digital_url,
              },
            ],
          },
        },
      };

      return await firstValueFrom(
        this._axiosService.onAxiosRequest(send_message_payload),
      );
    } catch (error) {
      // throw error;
    }
  }

  private async sendMessagePembayaran(
    invoice: any,
    payload_info: any,
    channel_whatsapp: any,
  ) {
    try {
      const send_message_payload = {
        method: payload_info.method,
        url: payload_info.url,
        headers: this.generateHeader(
          payload_info.method,
          payload_info.url,
          channel_whatsapp,
        ),
        data: {
          to_name: invoice.pelanggan.full_name,
          to_number: invoice.pelanggan.whatsapp,
          message_template_id: payload_info.message_template_id,
          channel_integration_id: process.env.QONTAK_CHANNEL_INTEGRATION_ID,
          language: {
            code: 'id',
          },
          parameters: {
            buttons: [
              {
                index: '0',
                type: 'URL',
                value:
                  payload_info.message_variable.invoice_digital_url.replace(
                    'https://checkout.linkbit.net.id',
                    '',
                  ),
              },
            ],
            body: [
              {
                key: '1',
                value: 'customer_name',
                value_text: payload_info.message_variable.full_name,
              },
              {
                key: '2',
                value: 'pelanggan_code',
                value_text: payload_info.message_variable.pelanggan_code,
              },
              {
                key: '3',
                value: 'product_name',
                value_text: payload_info.message_variable.product_name,
              },
              {
                key: '4',
                value: 'periode',
                value_text: payload_info.message_variable.invoice_date,
              },
              {
                key: '5',
                value: 'total',
                value_text: payload_info.message_variable.total,
              },
            ],
          },
        },
      };

      return await firstValueFrom(
        this._axiosService.onAxiosRequest(send_message_payload),
      );
    } catch (error) {
      // throw error;
    }
  }

  private async sendMessageInvoiceManual(
    invoice: any,
    payload_info: any,
    channel_whatsapp: any,
  ) {
    try {
      const send_message_payload = {
        method: payload_info.method,
        url: payload_info.url,
        headers: this.generateHeader(
          payload_info.method,
          payload_info.url,
          channel_whatsapp,
        ),
        data: {
          to_name: invoice.pelanggan.full_name,
          to_number: invoice.pelanggan.whatsapp,
          message_template_id: payload_info.message_template_id,
          channel_integration_id: process.env.QONTAK_CHANNEL_INTEGRATION_ID,
          language: {
            code: 'id',
          },
          parameters: {
            buttons: [
              {
                index: '0',
                type: 'URL',
                value: payload_info.message_variable.checkout_url.replace(
                  'https://checkout.linkbit.net.id',
                  '',
                ),
              },
            ],
            body: [
              {
                key: '1',
                value: 'customer_name',
                value_text: payload_info.message_variable.full_name,
              },
              {
                key: '2',
                value: 'pelanggan_code',
                value_text: payload_info.message_variable.pelanggan_code,
              },
              {
                key: '3',
                value: 'product_name',
                value_text: payload_info.message_variable.product_name,
              },
              {
                key: '4',
                value: 'periode',
                value_text: payload_info.message_variable.invoice_date,
              },
              {
                key: '5',
                value: 'total',
                value_text: payload_info.message_variable.total,
              },
            ],
          },
        },
      };

      return await firstValueFrom(
        this._axiosService.onAxiosRequest(send_message_payload),
      );
    } catch (error) {
      // throw error;
    }
  }
}
