import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { InvoiceModel } from './invoice.model';
import { Request } from 'express';
import { SettingCompanyService } from 'src/setting-company/setting-company.service';
import { firstValueFrom } from 'rxjs';
import { AxiosService } from 'src/utility/axios.service';
import { UtilityService } from 'src/utility/utility.service';
import { Cron, Interval } from '@nestjs/schedule';

@Injectable({ scope: Scope.TRANSIENT })
export class InvoiceService {

    private sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    constructor(
        private _axiosService: AxiosService,
        private _prismaService: PrismaService,
        private _utilityService: UtilityService,
        private _settingCompanyService: SettingCompanyService,
    ) { }

    async getAll(req: Request, query: InvoiceModel.IInvoiceQueryParams): Promise<InvoiceModel.GetAllInvoice> {
        try {
            let queries: any = {
                ...query,
                is_deleted: false
            };

            let newQueries: any = Object.keys(queries).reduce((aggregate, property) => {
                if (property == 'is_deleted') {
                    aggregate[property] = false;
                };

                if (property == 'id_invoice' || property == 'id_product' || property == 'id_setting_company' || property == 'id_pelanggan') {
                    aggregate[property] = parseInt(queries[property] as any);
                };

                if (property == 'invoice_date') {
                    const queryDate = new Date(queries[property]);
                    const year = queryDate.getFullYear();
                    const month = queryDate.getMonth(); // No need to subtract 1

                    const startDate = new Date(year, month, 1); // First day of the month
                    const endDate = new Date(year, month + 1, 1); // First day of the next month

                    aggregate[property] = {
                        gt: startDate, // Greater than or equal to the first day of the month
                        lt: endDate, // Less than the first day of the next month
                    };
                };

                if (property == 'invoice_number' || property == 'invoice_status') {
                    aggregate[property] = {
                        contains: queries[property],
                        mode: 'insensitive'
                    }
                };

                return aggregate;
            }, {});


            newQueries.pelanggan = {
                id_setting_company: parseInt(req['user']['id_setting_company'])
            };

            let res = await this._prismaService
                .invoice
                .findMany({
                    where: newQueries,
                    include: {
                        pelanggan: {
                            select: {
                                id_pelanggan: true,
                                full_name: true,
                                pelanggan_code: true,
                                whatsapp: true,
                                setting_company: {
                                    select: {
                                        id_setting_company: true,
                                        company_name: true
                                    }
                                }
                            }
                        },
                        product: {
                            select: {
                                id_product: true,
                                product_name: true,
                            },
                        },
                        payment: {
                            select: {
                                id_payment: true,
                                create_at: true,
                                payment_status: true,
                                payment_method: true,
                                payment_amount: true
                            },
                            orderBy: {
                                create_at: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        invoice_date: 'asc'
                    }
                });

            return {
                status: true,
                message: '',
                data: res.map((item) => {
                    return {
                        id_invoice: item.id_invoice,
                        invoice_number: item.invoice_number,
                        invoice_date: item.invoice_date,
                        id_pelanggan: item.id_pelanggan,
                        id_setting_company: item.pelanggan.setting_company.id_setting_company,
                        company_name: item.pelanggan.setting_company.company_name,
                        full_name: item.pelanggan.full_name,
                        pelanggan_code: item.pelanggan.pelanggan_code,
                        whatsapp: item.pelanggan.whatsapp,
                        id_pelanggan_product: item.id_pelanggan_product,
                        id_product: item.id_product,
                        product_name: item.product.product_name,
                        price: item.price,
                        diskon_percentage: item.diskon_percentage,
                        diskon_rupiah: item.diskon_rupiah,
                        pajak: item.pajak,
                        admin_fee: item.admin_fee,
                        unique_code: item.unique_code,
                        total: item.total,
                        due_date: item.due_date,
                        notes: item.notes,
                        invoice_status: item.invoice_status,
                        id_payment: item.payment.length ? item.payment[0].id_payment : null,
                        payment_date: item.payment.length ? item.payment[0].create_at : null,
                        payment_status: item.payment.length ? item.payment[0].payment_status : null,
                        payment_method: item.payment.length ? item.payment[0].payment_method : null,
                        payment_amount: item.payment.length ? item.payment[0].payment_amount : null,
                        create_at: item.create_at,
                        create_by: item.create_by,
                        update_at: item.update_at,
                        update_by: item.update_by,
                        is_deleted: item.is_deleted,
                        delete_at: item.delete_at,
                        delete_by: item.delete_by,
                    }
                })
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async getById(id_invoice: number): Promise<InvoiceModel.GetByIdInvoice> {
        try {
            let res: any = await this._prismaService
                .invoice
                .findUnique({
                    where: { id_invoice: parseInt(id_invoice as any) },
                    include: {
                        pelanggan: {
                            select: {
                                id_pelanggan: true,
                                full_name: true,
                                pelanggan_code: true,
                                whatsapp: true,
                                setting_company: {
                                    select: {
                                        id_setting_company: true,
                                        company_name: true
                                    }
                                }
                            }
                        },
                        product: {
                            select: {
                                id_product: true,
                                product_name: true,
                            },
                        },
                        payment: {
                            where: {
                                payment_status: 'PENDING',
                            },
                            select: {
                                id_payment: true,
                                create_at: true,
                                payment_status: true,
                                payment_method: true,
                                payment_amount: true
                            }
                        }
                    },
                });

            return {
                status: true,
                message: '',
                data: {
                    id_invoice: res.id_invoice,
                    invoice_number: res.invoice_number,
                    invoice_date: res.invoice_date,
                    id_pelanggan: res.id_pelanggan,
                    id_setting_company: res.pelanggan.setting_company.id_setting_company,
                    company_name: res.pelanggan.setting_company.company_name,
                    full_name: res.pelanggan.full_name,
                    pelanggan_code: res.pelanggan.pelanggan_code,
                    whatsapp: res.pelanggan.whatsapp,
                    id_pelanggan_product: res.id_pelanggan_product,
                    id_product: res.id_product,
                    product_name: res.product.product_name,
                    price: res.price,
                    diskon_percentage: res.diskon_percentage,
                    diskon_rupiah: res.diskon_rupiah,
                    pajak: res.pajak,
                    admin_fee: res.admin_fee,
                    unique_code: res.unique_code,
                    total: res.total,
                    due_date: res.due_date,
                    notes: res.notes,
                    invoice_status: res.invoice_status,
                    id_payment: res.payment.length ? res.payment[0].id_payment : null,
                    payment_date: res.payment.length ? res.payment[0].create_at : null,
                    payment_status: res.payment.length ? res.payment[0].payment_status : null,
                    payment_method: res.payment.length ? res.payment[0].payment_method : null,
                    payment_amount: res.payment.length ? res.payment[0].payment_amount : null,
                    create_at: res.create_at,
                    create_by: res.create_by,
                    update_at: res.update_at,
                    update_by: res.update_by,
                    is_deleted: res.is_deleted,
                    delete_at: res.delete_at,
                    delete_by: res.delete_by,
                }
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async create(req: Request, payload: InvoiceModel.CreateInvoice): Promise<any> {
        try {
            const queryDate = new Date(payload.invoice_date);
            const year = queryDate.getFullYear();
            const month = queryDate.getMonth() + 1;

            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 1);

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

            const invoice_number = `INV-${payload.id_pelanggan}-${month > 9 ? month : `0${month}`}${year}-${prefix}${invoiceMonthCount + 1}`;
            let res = await this._prismaService
                .invoice
                .create({
                    data: {
                        ...payload,
                        invoice_number: invoice_number,
                        create_at: new Date(),
                        create_by: parseInt(req['user']['id_user'] as any)
                    }
                })

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async update(req: Request, payload: InvoiceModel.UpdateInvoice): Promise<any> {
        try {
            const { id_invoice, ...data } = payload;

            let res = await this._prismaService
                .invoice
                .update({
                    where: { id_invoice: parseInt(id_invoice as any) },
                    data: {
                        ...data,
                        update_at: new Date(),
                        update_by: parseInt(req['user']['id_user'] as any)
                    }
                })

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async delete(req: Request, id_invoice: number): Promise<any> {
        try {
            const findPayment = await this._prismaService
                .payment
                .findFirst({
                    where: {
                        id_invoice: parseInt(id_invoice as any)
                    }
                });

            if (findPayment && findPayment.id_payment) {
                if (findPayment.payment_status == 'PAID') {
                    return {
                        status: false,
                        message: 'Invoice Telah Terbayar',
                        data: null
                    }
                };

                const cancelPaymentPending = await this._prismaService
                    .payment
                    .update({
                        where: {
                            id_payment: parseInt(findPayment.id_payment as any)
                        },
                        data: {
                            payment_status: 'CANCELED',
                            update_at: new Date(),
                            update_by: parseInt(req['user']['id_user'] as any)
                        }
                    });

                if (!cancelPaymentPending) {
                    return {
                        status: false,
                        message: 'Payment Gagal Dibatalkan',
                        data: null
                    }
                };
            };

            let res = await this._prismaService
                .invoice
                .update({
                    where: { id_invoice: parseInt(id_invoice as any) },
                    data: {
                        is_deleted: true,
                        delete_at: new Date(),
                        delete_by: parseInt(req['user']['id_user'] as any)
                    }
                })

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async sendMessage(id_invoice: any): Promise<any> {
        try {
            const invoice = await this._prismaService
                .invoice
                .findUnique({
                    where: {
                        id_invoice: parseInt(id_invoice)
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

            if (!invoice.pelanggan.setting_company.api_key_wa) {
                return {
                    status: false,
                    message: "API Key WA belum diatur"
                }
            };

            const token = this._utilityService.onEncrypt(JSON.stringify(id_invoice));

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
                            id_transaksi: invoice.id_invoice,
                            id_setting_company: invoice.pelanggan.id_setting_company,
                            additional_info: invoice,
                            sent_at: new Date(),
                            sent_by: invoice.create_by,
                            status: 'FAILED'
                        }
                    })

                return {
                    status: false,
                    message: mpwaSendMessageResult.data.msg,
                }
            }

            await this._prismaService
                .log_whatsapp_message
                .create({
                    data: {
                        id_transaksi: invoice.id_invoice,
                        id_setting_company: invoice.pelanggan.id_setting_company,
                        additional_info: invoice,
                        sent_at: new Date(),
                        sent_by: invoice.create_by,
                        status: 'SUCCESS'
                    }
                })

            return {
                status: true,
                message: 'Pesan berhasil dikirimkan',
                data: id_invoice,
            };

        } catch (error) {
            throw new HttpException(
                {
                    status: false,
                    message: error.response.data.msg
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
