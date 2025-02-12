import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaymentModel } from './payment.model';
import { InvoiceService } from 'src/invoice/invoice.service';
import { UtilityService } from 'src/utility/utility.service';
import { Request } from 'express';

@Injectable({ scope: Scope.TRANSIENT })
export class PaymentService {

    constructor(
        private _prismaService: PrismaService,
        private _utilityService: UtilityService,
        private _invoiceService: InvoiceService,
    ) { }

    async getAll(query: PaymentModel.IPaymentQueryParams): Promise<PaymentModel.GetAllPayment> {
        try {
            let queries = {
                ...query,
                is_deleted: false
            }

            let res = await this._prismaService
                .payment
                .findMany({
                    where: Object.keys(queries).reduce((aggregate, property) => {
                        if (property == 'id_pelanggan' || property == 'id_product') {
                            aggregate[property] = parseInt(queries[property] as any);
                        }
                        return aggregate;
                    }, {}),
                    include: {
                        invoice: {
                            select: {
                                invoice_number: true,
                                invoice_date: true,
                                total: true,
                            }
                        },
                        pelanggan: {
                            select: {
                                id_pelanggan: true,
                                full_name: true,
                                pelanggan_code: true,
                            }
                        },
                        product: {
                            select: {
                                id_product: true,
                                product_name: true,
                            },
                        }
                    },
                    orderBy: {
                        id_invoice: 'asc'
                    }
                });

            return {
                status: true,
                message: '',
                data: res.map((item) => {
                    return {
                        id_payment: item.id_payment,
                        id_invoice: item.id_invoice,
                        invoice_number: item.invoice.invoice_number,
                        invoice_date: item.invoice.invoice_date,
                        total: item.invoice.total,
                        id_pelanggan: item.id_pelanggan,
                        full_name: item.pelanggan.full_name,
                        pelanggan_code: item.pelanggan.pelanggan_code,
                        id_product: item.id_product,
                        product_name: item.product.product_name,
                        payment_token: item.payment_token,
                        payment_id: item.payment_id,
                        payment_number: item.payment_number,
                        payment_date: item.payment_date,
                        payment_method: item.payment_method,
                        payment_status: item.payment_status,
                        payment_amount: item.payment_amount,
                        payment_provider: item.payment_provider,
                        create_at: item.create_at,
                        create_by: item.create_by,
                        update_at: item.update_at,
                        update_by: item.update_by,
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

    async getById(id_payment: number): Promise<PaymentModel.GetByIdPayment> {
        try {
            let res: any = await this._prismaService
                .payment
                .findUnique({
                    where: { id_payment: parseInt(id_payment as any) },
                    include: {
                        invoice: {
                            select: {
                                invoice_number: true,
                                invoice_date: true,
                                total: true,
                            }
                        },
                        pelanggan: {
                            select: {
                                id_pelanggan: true,
                                full_name: true,
                                pelanggan_code: true,
                            }
                        },
                        product: {
                            select: {
                                id_product: true,
                                product_name: true,
                            },
                        }
                    },
                });

            return {
                status: true,
                message: '',
                data: {
                    id_payment: res.id_payment,
                    id_invoice: res.id_invoice,
                    invoice_number: res.invoice.invoice_number,
                    invoice_date: res.invoice.invoice_date,
                    total: res.invoice.total,
                    id_pelanggan: res.id_pelanggan,
                    full_name: res.pelanggan.full_name,
                    pelanggan_code: res.pelanggan.pelanggan_code,
                    id_product: res.id_product,
                    product_name: res.product.product_name,
                    payment_token: res.payment_token,
                    payment_id: res.payment_id,
                    payment_number: res.payment_number,
                    payment_date: res.payment_date,
                    payment_method: res.payment_method,
                    payment_status: res.payment_status,
                    payment_amount: res.payment_amount,
                    payment_provider: res.payment_provider,
                    create_at: res.create_at,
                    create_by: res.create_by,
                    update_at: res.update_at,
                    update_by: res.update_by,
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

    async getCheckoutPageUrl(id_invoice: number) {
        try {
            let invoice = await this._invoiceService.getById(id_invoice);

            if (!invoice.status) {
                return {
                    status: false,
                    message: 'Invoice Tidak Ditemukan',
                    data: null
                }
            }

            const token = this._utilityService.onEncrypt(JSON.stringify(invoice.data));

            return {
                status: true,
                message: '',
                data: `${process.env.CHECKOUT_URL}?token=${token}`
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

    async getDataFromTokenCheckout(token: string) {
        try {
            const data = this._utilityService.onDecrypt(token);

            if (!data) {
                return {
                    status: false,
                    message: 'Token Is Invalid',
                    data: null
                }
            }

            return {
                status: true,
                message: '',
                data: JSON.parse(data)
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

    async create(req: Request, payload: PaymentModel.CreatePayment): Promise<any> {
        try {
            let res = await this._prismaService
                .payment
                .create({
                    data: {
                        ...payload,
                        payment_provider: 'XENDIT',
                        create_at: new Date(),
                        create_by: payload.id_pelanggan
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

    async update(req: Request, payload: PaymentModel.UpdatePayment): Promise<any> {
        try {
            const { id_payment, ...data } = payload;

            let res = await this._prismaService
                .payment
                .update({
                    where: { id_payment: parseInt(id_payment as any) },
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
}
