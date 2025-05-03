import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LogActivityModel } from './log-activity.model';
import { Request } from 'express';
import { InvoiceService } from 'src/invoice/invoice.service';

@Injectable({ scope: Scope.TRANSIENT })
export class LogActivityService {

    constructor(
        private _prismaService: PrismaService,
        private _invoiceService: InvoiceService,
    ) { }

    async getAllLogActivity(req: Request): Promise<LogActivityModel.GetAllLogActivity> {
        try {
            let res: any[] = await this._prismaService
                .log_activity_user
                .findMany({
                    where: {
                        user: {
                            setting_company: {
                                id_setting_company: parseInt(req['user']['id_setting_company'])
                            }
                        }
                    },
                    orderBy: {
                        create_at: 'asc'
                    },
                });

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

    async getAllLogSendMessage(req: Request): Promise<LogActivityModel.GetAllLogSendMessage> {
        try {
            let res: any[] = await this._prismaService
                .log_whatsapp_message
                .findMany({
                    where: {
                        id_setting_company: parseInt(req['user']['id_setting_company']),
                        type: 'INVOICE'
                    },
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
                    }
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
            const resultSend = await this._invoiceService.sendMessage(parseInt(id_invoice as any));

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
