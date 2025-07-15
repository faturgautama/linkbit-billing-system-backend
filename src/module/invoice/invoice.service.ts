import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { InvoiceModel } from './invoice.model';
import { Request } from 'express';
import { InvoiceCronService } from '../../scheduler/invoice-cron.service';
import { SendMessageCronService } from '../../scheduler/send-message-cron.service';
import { UtilityService } from 'src/helper/utility/utility.service';
import { ChannelProviderRouterService } from 'src/helper/services/channel-whatsapp-provider/channel-provider-router.service';
import { WhatsappChannelProviderModel } from 'src/helper/services/channel-whatsapp-provider/channel-provider.model';

@Injectable({ scope: Scope.TRANSIENT })
export class InvoiceService {
    constructor(
        private _prismaService: PrismaService,
        private _utilityService: UtilityService,
        private _invoiceCronService: InvoiceCronService,
        private _sendMessageCronService: SendMessageCronService,
        private _channelProviderRouterService: ChannelProviderRouterService,
    ) { }

    async getAll(
        req: Request,
        query: InvoiceModel.IInvoiceQueryParams,
    ): Promise<InvoiceModel.GetAllInvoice> {
        try {
            const queries: any = {
                ...query,
                is_deleted: false,
            };

            // 1. Advanced filter object
            let newQueries: any = {
                AND: [], // We'll push advanced filters here
            };

            // 2. Parse and build individual field filters
            Object.entries(queries).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '') return;

                if (key === 'is_deleted') {
                    newQueries.AND.push({ is_deleted: false });
                } else if (
                    [
                        'id_invoice',
                        'id_product',
                        'id_setting_company',
                        'id_pelanggan',
                    ].includes(key)
                ) {
                    newQueries.AND.push({ [key]: parseInt(value as any) });
                } else if (key === 'invoice_date') {
                    const date = new Date(value as any);
                    const start = new Date(date.getFullYear(), date.getMonth(), 1);
                    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                    newQueries.AND.push({
                        invoice_date: {
                            gt: start,
                            lt: end,
                        },
                    });
                } else if (key === 'invoice_number' || key === 'invoice_status') {
                    newQueries.AND.push({
                        [key]: {
                            contains: value,
                            mode: 'insensitive',
                        },
                    });
                } else if (key === 'pelanggan_code' || key === 'full_name') {
                    // These are in nested pelanggan relation
                    newQueries.AND.push({
                        pelanggan: {
                            [key]: {
                                contains: value,
                                mode: 'insensitive',
                            },
                        },
                    });
                } else if (key === 'product_name') {
                    // These are in nested product relation
                    newQueries.AND.push({
                        product: {
                            [key]: {
                                contains: value,
                                mode: 'insensitive',
                            },
                        },
                    });
                }
            });

            // 3. Global search
            if (queries.search && typeof queries.search === 'string') {
                const s = queries.search.trim();
                const isValidDate = !isNaN(Date.parse(s));

                const globalSearchOR: any[] = [
                    { invoice_number: { contains: s, mode: 'insensitive' } },
                    { invoice_status: { contains: s, mode: 'insensitive' } },
                    { pelanggan: { full_name: { contains: s, mode: 'insensitive' } } },
                    {
                        pelanggan: { pelanggan_code: { contains: s, mode: 'insensitive' } },
                    },
                    { product: { product_name: { contains: s, mode: 'insensitive' } } },
                ];

                if (isValidDate) {
                    globalSearchOR.push({
                        invoice_date: {
                            equals: new Date(s),
                        },
                    });
                }

                newQueries.OR = globalSearchOR;
            }

            // 4. Add perusahaan filter
            newQueries.AND.push({
                pelanggan: {
                    id_setting_company: parseInt(req['user']['id_setting_company']),
                },
            });

            let res = await this._prismaService.invoice.findMany({
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
                                    company_name: true,
                                },
                            },
                        },
                    },
                    product: {
                        select: {
                            id_product: true,
                            product_name: true,
                        },
                    },
                    payment: {
                        where: {
                            payment_status: 'PAID',
                        },
                        select: {
                            id_payment: true,
                            create_at: true,
                            payment_status: true,
                            payment_method: true,
                            payment_amount: true,
                        },
                        orderBy: {
                            create_at: 'asc',
                        },
                    },
                },
                orderBy: {
                    invoice_date: 'asc',
                },
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
                        id_setting_company:
                            item.pelanggan.setting_company.id_setting_company,
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
                        payment_date: item.payment.length
                            ? item.payment[0].create_at
                            : null,
                        payment_status: item.payment.length
                            ? item.payment[0].payment_status
                            : null,
                        payment_method: item.payment.length
                            ? item.payment[0].payment_method
                            : null,
                        payment_amount: item.payment.length
                            ? item.payment[0].payment_amount
                            : null,
                        create_at: item.create_at,
                        create_by: item.create_by,
                        update_at: item.update_at,
                        update_by: item.update_by,
                        is_deleted: item.is_deleted,
                        delete_at: item.delete_at,
                        delete_by: item.delete_by,
                    };
                }),
            };
        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status,
            );
        }
    }

    async getById(id_invoice: number): Promise<any> {
        try {
            let res: any = await this._prismaService.invoice.findUnique({
                where: { id_invoice: parseInt(id_invoice as any) },
                include: {
                    pelanggan: {
                        select: {
                            id_pelanggan: true,
                            full_name: true,
                            alamat: true,
                            pelanggan_code: true,
                            whatsapp: true,
                            setting_company: {
                                select: {
                                    id_setting_company: true,
                                    company_name: true,
                                    is_use_pg_admin_fee: true,
                                    api_key_pg: true,
                                },
                            },
                        },
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
                            payment_amount: true,
                        },
                    },
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
                    is_use_pg_admin_fee:
                        res.pelanggan.setting_company.is_use_pg_admin_fee,
                    api_key_pg: res.pelanggan.setting_company.api_key_pg,
                    full_name: res.pelanggan.full_name,
                    alamat: res.pelanggan.alamat,
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
                    payment_status: res.payment.length
                        ? res.payment[0].payment_status
                        : null,
                    payment_method: res.payment.length
                        ? res.payment[0].payment_method
                        : null,
                    payment_amount: res.payment.length
                        ? res.payment[0].payment_amount
                        : null,
                    create_at: res.create_at,
                    create_by: res.create_by,
                    update_at: res.update_at,
                    update_by: res.update_by,
                    is_deleted: res.is_deleted,
                    delete_at: res.delete_at,
                    delete_by: res.delete_by,
                },
            };
        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status,
            );
        }
    }

    async getFromToken(token: string): Promise<any> {
        try {
            const data = this._utilityService.onDecrypt(token);

            if (!data) {
                return {
                    status: false,
                    message: 'Token Is Invalid',
                    data: null,
                };
            }

            let res: any = await this._prismaService.invoice.findUnique({
                where: {
                    id_invoice: parseInt(data.id_invoice ? data.id_invoice : data),
                },
                include: {
                    pelanggan: {
                        select: {
                            id_pelanggan: true,
                            full_name: true,
                            alamat: true,
                            pelanggan_code: true,
                            whatsapp: true,
                            setting_company: {
                                select: {
                                    id_setting_company: true,
                                    company_name: true,
                                    tagihan_editor_invoice: true,
                                },
                            },
                        },
                    },
                    product: {
                        select: {
                            id_product: true,
                            product_name: true,
                        },
                    },
                },
            });

            const formattedRes = {
                id_invoice: res.id_invoice,
                invoice_number: res.invoice_number,
                invoice_date: this._utilityService.onFormatDate(
                    res.invoice_date,
                    'MMMM yyyy',
                ),
                id_pelanggan: res.id_pelanggan,
                id_setting_company: res.pelanggan.setting_company.id_setting_company,
                company_name: res.pelanggan.setting_company.company_name,
                full_name: res.pelanggan.full_name,
                alamat: res.pelanggan.alamat,
                pelanggan_code: res.pelanggan.pelanggan_code,
                whatsapp: res.pelanggan.whatsapp,
                id_pelanggan_product: res.id_pelanggan_product,
                id_product: res.id_product,
                product_name: res.product.product_name,
                price: this._utilityService.onFormatCurrency(res.price),
                diskon_percentage: res.diskon_percentage,
                diskon_rupiah: this._utilityService.onFormatCurrency(res.diskon_rupiah),
                pajak: this._utilityService.onFormatCurrency(res.pajak),
                admin_fee: this._utilityService.onFormatCurrency(res.admin_fee),
                unique_code: res.unique_code,
                total: this._utilityService.onFormatCurrency(res.total),
                due_date: this._utilityService.onFormatDate(res.due_date, 'DD-MM-yyyy'),
                notes: res.notes,
                invoice_status: res.invoice_status,
                create_at: this._utilityService.onFormatDate(
                    res.create_at,
                    'DD-MM-yyyy',
                ),
            };

            const template = res.pelanggan.setting_company.tagihan_editor_invoice;
            const newTemplate = template.replace(
                /\${(.*?)}/g,
                (_, key) => formattedRes[key.trim()] || '',
            );
            return {
                status: true,
                message: '',
                data: newTemplate,
            };
        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status,
            );
        }
    }

    async create(
        req: Request,
        payload: InvoiceModel.CreateInvoice,
    ): Promise<any> {
        try {
            const queryDate = new Date(payload.invoice_date);
            const year = queryDate.getFullYear();
            const month = queryDate.getMonth() + 1;

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

            const prefix =
                invoiceMonthCount < 10
                    ? '000'
                    : invoiceMonthCount < 100
                        ? '00'
                        : invoiceMonthCount < 1000
                            ? '0'
                            : '';

            const invoice_number = `INV-${payload.id_pelanggan}-${month > 9 ? month : `0${month}`
                }${year}-${prefix}${invoiceMonthCount + 1}`;
            let res = await this._prismaService.invoice.create({
                data: {
                    ...payload,
                    invoice_number: invoice_number,
                    create_at: new Date(),
                    create_by: parseInt(req['user']['id_user'] as any),
                },
            });

            return {
                status: true,
                message: '',
                data: res,
            };
        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status,
            );
        }
    }

    async update(
        req: Request,
        payload: InvoiceModel.UpdateInvoice,
    ): Promise<any> {
        try {
            const { id_invoice, ...data } = payload;

            let res = await this._prismaService.invoice.update({
                where: { id_invoice: parseInt(id_invoice as any) },
                data: {
                    ...data,
                    update_at: new Date(),
                    update_by: parseInt(req['user']['id_user'] as any),
                },
            });

            return {
                status: true,
                message: '',
                data: res,
            };
        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status,
            );
        }
    }

    async delete(req: Request, id_invoice: number): Promise<any> {
        try {
            const findPayment = await this._prismaService.payment.findFirst({
                where: {
                    id_invoice: parseInt(id_invoice as any),
                },
            });

            if (findPayment) {
                if (findPayment.payment_status == 'PAID') {
                    return {
                        status: false,
                        message: 'Invoice Telah Terbayar',
                        data: null,
                    };
                }

                const cancelPaymentPending = await this._prismaService.payment.delete({
                    where: {
                        id_payment: parseInt(findPayment.id_payment as any),
                    },
                });

                if (!cancelPaymentPending) {
                    return {
                        status: false,
                        message: 'Payment Gagal Dibatalkan',
                        data: null,
                    };
                }
            }

            let res = await this._prismaService.invoice.update({
                where: { id_invoice: parseInt(id_invoice as any) },
                data: {
                    invoice_status: 'CANCELED',
                    is_deleted: true,
                    delete_at: new Date(),
                    delete_by: parseInt(req['user']['id_user'] as any),
                },
            });

            return {
                status: true,
                message: '',
                data: res,
            };
        } catch (error) {
            console.log('error =>', error);

            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status,
            );
        }
    }

    async sendMessage(req: Request, id_invoice: any): Promise<any> {
        try {
            const invoice = await this._prismaService.invoice.findUnique({
                where: {
                    id_invoice: parseInt(id_invoice),
                },
                include: {
                    pelanggan: {
                        include: {
                            setting_company: true,
                        },
                    },
                    product: true,
                },
            });

            return await this._channelProviderRouterService.handleSendMessage(
                req,
                'INVOICE',
                invoice,
            );
        } catch (error) {
            console.log('error =>', error);
            throw new HttpException(
                {
                    status: false,
                    message: error.response.data.msg,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async sendMessageBatch(req: Request, data: any[]): Promise<any> {
        try {
            let success = 0, failed = 0;

            for (const item of data) {
                const invoice = await this._prismaService.invoice.findUnique({
                    where: {
                        id_invoice: parseInt(item.id_invoice),
                    },
                    include: {
                        pelanggan: {
                            include: {
                                setting_company: true,
                            },
                        },
                        product: true,
                    },
                });

                const checkLog = await this._prismaService.log_whatsapp_message.findFirst({
                    where: {
                        id_invoice: parseInt(invoice.id_invoice as any)
                    }
                });

                if (!checkLog) {
                    console.log("invoice =>", {
                        id_invoice: invoice.id_invoice,
                        pelanggan: invoice.pelanggan.full_name,
                        invoice_number: invoice.invoice_number,
                        invoice_date: invoice.invoice_date,
                        invoice_status: invoice.invoice_status,
                        notes: invoice.notes,
                    });
                    console.log("===================================");

                    req['user']['id_setting_company'] = invoice.pelanggan.id_setting_company;
                    let resultMessage = await this._channelProviderRouterService.handleSendMessage(
                        req,
                        'INVOICE',
                        invoice,
                    );

                    if (resultMessage.status) {
                        success += 1;
                    } else {
                        failed += 1;
                    }
                } else {
                    failed += 1;
                }
            }

            return {
                status: true,
                message: `Berhasil kirim ${success} pesan. Gagal kirim ${failed} pesan`,
                data: data.length,
            };

        } catch (error) {
            console.log('error =>', error);
            throw new HttpException(
                {
                    status: false,
                    message: error.response.data.msg,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async sendMessageBatchManually(req: Request): Promise<any> {
        try {
            const invoices = await this._prismaService.invoice.findMany({
                where: {
                    invoice_date: {
                        gte: new Date('2025-06-30T00:00:00.000Z'),
                        lte: new Date('2025-07-31T23:59:59.999Z'),
                    },
                    invoice_status: 'PENDING',
                },
                include: {
                    pelanggan: {
                        include: {
                            setting_company: true,
                        },
                    },
                    product: true,
                },
            });

            for (const invoice of invoices) {
                if (invoice.id_invoice > 2259 && invoice.invoice_status == 'PENDING') {
                    req['user']['id_setting_company'] = invoice.pelanggan.id_setting_company;

                    const checkLog = await this._prismaService.log_whatsapp_message.findFirst({
                        where: {
                            id_invoice: parseInt(invoice.id_invoice as any)
                        }
                    });

                    if (!checkLog) {
                        console.log("invoice =>", {
                            id_invoice: invoice.id_invoice,
                            pelanggan: invoice.pelanggan.full_name,
                            invoice_number: invoice.invoice_number,
                            invoice_date: invoice.invoice_date,
                            invoice_status: invoice.invoice_status,
                            notes: invoice.notes,
                        });
                        console.log("===================================");
                        const resultMessage = await this._channelProviderRouterService.handleSendMessage(req, 'INVOICE', invoice);
                    }
                }
            }

            return {
                status: true,
                message: 'Pesan berhasil dikirim ke semua invoice.',
                total: invoices.length,
            };
        } catch (error) {
            console.log('error =>', error);
            throw new HttpException(
                {
                    status: false,
                    message: error.response.data.msg,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async retriggerJobInvoice() {
        try {
            await this._invoiceCronService.generateInvoices();

            return {
                status: true,
                message: 'Job is retriggered',
                data: null,
            };
        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status,
            );
        }
    }

    async retriggerJobSendMessage() {
        try {
            await this._sendMessageCronService.sendInvoiceNotifications();

            return {
                status: true,
                message: 'Job is retriggered',
                data: null,
            };
        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message,
                },
                status,
            );
        }
    }
}
