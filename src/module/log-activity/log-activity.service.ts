import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LogActivityModel } from './log-activity.model';
import { Request } from 'express';
import { InvoiceService } from 'src/module/invoice/invoice.service';

@Injectable({ scope: Scope.TRANSIENT })
export class LogActivityService {

    constructor(
        private _prismaService: PrismaService,
        private _invoiceService: InvoiceService,
    ) { }

    async getAllLogActivity(req: Request, query?: LogActivityModel.ILogQueryParams): Promise<LogActivityModel.GetAllLogActivity> {
        try {
            let newQueries: any = Object.keys(query).reduce((aggregate, property) => {
                if (property == 'full_name') {
                    aggregate['user'] = {
                        full_name: {
                            contains: query[property],
                            mode: 'insensitive'
                        }
                    };
                };

                if (property == 'create_at') {
                    const queryDate = new Date(query[property]);
                    const year = queryDate.getFullYear();
                    const month = queryDate.getMonth(); // No need to subtract 1

                    const startDate = new Date(year, month, 1); // First day of the month
                    const endDate = new Date(year, month + 1, 1); // First day of the next month

                    aggregate[property] = {
                        gt: startDate, // Greater than or equal to the first day of the month
                        lt: endDate, // Less than the first day of the next month
                    };
                };
                return aggregate;
            }, {});

            newQueries.user = {
                ...newQueries.user,
                id_setting_company: parseInt(req['user']['id_setting_company'])
            };

            let res: any[] = await this._prismaService
                .log_activity_user
                .findMany({
                    where: newQueries,
                    include: {
                        user: {
                            select: {
                                full_name: true
                            }
                        },

                    },
                    orderBy: {
                        create_at: 'asc'
                    },
                });

            return {
                status: true,
                message: '',
                data: res.map((item: any) => {
                    const { user, ...res } = item;
                    return {
                        ...res,
                        full_name: user.full_name
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

    async getAllLogSendMessage(req: Request, query?: LogActivityModel.ILogQueryParams): Promise<LogActivityModel.GetAllLogSendMessage> {
        try {
            let newQueries: any = Object.keys(query).reduce((aggregate, property) => {
                if (property == 'full_name') {
                    aggregate['invoice'] = {
                        pelanggan: {
                            full_name: {
                                contains: query['full_name'],
                                mode: 'insensitive'
                            }
                        }
                    };
                };

                if (property == 'sent_at') {
                    const queryDate = new Date(query[property]);
                    const year = queryDate.getFullYear();
                    const month = queryDate.getMonth(); // No need to subtract 1

                    const startDate = new Date(year, month, 1); // First day of the month
                    const endDate = new Date(year, month + 1, 1); // First day of the next month

                    aggregate[property] = {
                        gt: startDate, // Greater than or equal to the first day of the month
                        lt: endDate, // Less than the first day of the next month
                    };
                };

                if (property == 'status') {
                    aggregate[property] = {
                        contains: query[property],
                        mode: 'insensitive'
                    }
                };

                return aggregate;
            }, {});

            newQueries.setting_company = {
                id_setting_company: parseInt(req['user']['id_setting_company'])
            };

            newQueries.type = 'INVOICE';

            let res: any[] = await this._prismaService
                .log_whatsapp_message
                .findMany({
                    where: newQueries,
                    take: 100,
                    orderBy: {
                        sent_at: 'asc'
                    },
                    include: {
                        invoice: {
                            select: {
                                invoice_number: true,
                                pelanggan: {
                                    select: {
                                        full_name: true,
                                        alamat: true,
                                    }
                                },
                                price: true,
                                pelanggan_product: {
                                    select: {
                                        product: {
                                            select: {
                                                product_name: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                });

            return {
                status: true,
                message: '',
                data: res.map((item) => {
                    return {
                        id_log_whatsapp_message: item.id_log_whatsapp_message,
                        id_setting_company: item.id_setting_company,
                        id_invoice: item.id_invoice,
                        no_ref: item.invoice.invoice_number,
                        full_name: item.invoice.pelanggan.full_name,
                        alamat: item.invoice.pelanggan.alamat,
                        price: item.invoice.price,
                        product_name: item.invoice.pelanggan_product.product.product_name,
                        additional_info: item.additional_info,
                        sent_at: item.sent_at,
                        sent_by: item.sent_by,
                        resent_at: item.resent_at,
                        resent_by: item.resent_by,
                        status: item.status,
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

    async resentLogSendMessage(id_invoice: number, req: Request): Promise<LogActivityModel.GetAllLogSendMessage> {
        try {
            const resultSend = await this._invoiceService.sendMessage(req, parseInt(id_invoice as any));

            if (!resultSend) {
                return {
                    status: false,
                    message: "Gagal Mengirimkan Ulang Pesan Tagihan",
                    data: null
                }
            }

            return {
                status: true,
                message: 'Pesan Tagihan Berhasil Di Kirim Ulang',
                data: resultSend.data
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
}
