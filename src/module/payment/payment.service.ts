import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaymentModel } from './payment.model';
import { InvoiceService } from 'src/module/invoice/invoice.service';
import { Request } from 'express';
import { firstValueFrom, map } from 'rxjs';
import { AppGateway } from 'src/app.gateway';
import { AxiosService } from 'src/helper/utility/axios.service';
import { ImageHelperService } from 'src/helper/utility/image-helper.service';
import { UtilityService } from 'src/helper/utility/utility.service';
import { SettingCompanyService } from '../setting-company/setting-company.service';
import { ChannelProviderRouterService } from 'src/helper/services/channel-whatsapp-provider/channel-provider-router.service';
import { WhatsappChannelProviderModel } from 'src/helper/services/channel-whatsapp-provider/channel-provider.model';

@Injectable({ scope: Scope.TRANSIENT })
export class PaymentService {

    constructor(
        private _appGateway: AppGateway,
        private _axiosService: AxiosService,
        private _prismaService: PrismaService,
        private _utilityService: UtilityService,
        private _invoiceService: InvoiceService,
        private _imageHelperService: ImageHelperService,
        private _settingCompanyService: SettingCompanyService,
        private _channelProviderRouterService: ChannelProviderRouterService
    ) { }

    async getAll(req: Request, query: PaymentModel.IPaymentQueryParams): Promise<PaymentModel.GetAllPayment> {
        try {
            const queries = Object.entries(query).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);

            const newQueries: any = {
                // Direct filters on payment
                ...(queries.payment_status && {
                    payment_status: { contains: queries.payment_status, mode: 'insensitive' },
                }),
                ...(queries.payment_method && {
                    payment_method: { contains: queries.payment_method, mode: 'insensitive' },
                }),
                ...(queries.payment_number && {
                    payment_number: { contains: queries.payment_number, mode: 'insensitive' },
                }),
                ...(queries.payment_date && {
                    payment_date: (() => {
                        const date = new Date(queries.payment_date);
                        const start = new Date(date.setHours(0, 0, 0, 0));
                        const end = new Date(date.setHours(23, 59, 59, 999));
                        return { gte: start, lte: end };
                    })()
                }),

                // Relations
                invoice: {
                    ...(queries.invoice_number && {
                        invoice_number: { contains: queries.invoice_number, mode: 'insensitive' },
                    }),
                    ...(queries.invoice_date && (() => {
                        const date = new Date(queries.invoice_date);
                        const year = date.getFullYear();
                        const month = date.getMonth();
                        const start = new Date(year, month, 1);
                        const end = new Date(year, month + 1, 1);
                        return { invoice_date: { gt: start, lt: end } };
                    })())
                },

                pelanggan: {
                    id_setting_company: parseInt(req['user']['id_setting_company']),
                    ...(queries.full_name && {
                        full_name: { contains: queries.full_name, mode: 'insensitive' },
                    }),
                    ...(queries.pelanggan_code && {
                        pelanggan_code: { contains: queries.pelanggan_code, mode: 'insensitive' },
                    }),
                },

                product: queries.product_name
                    ? { product_name: { contains: queries.product_name, mode: 'insensitive' } }
                    : undefined
            };

            // 🔍 Unified Search Query
            if (queries.search) {
                const keyword = queries.search;
                newQueries.OR = [
                    { payment_status: { contains: keyword, mode: 'insensitive' } },
                    { payment_method: { contains: keyword, mode: 'insensitive' } },
                    { pelanggan: { full_name: { contains: keyword, mode: 'insensitive' } } },
                    { pelanggan: { pelanggan_code: { contains: keyword, mode: 'insensitive' } } },
                    { pelanggan: { alamat: { contains: keyword, mode: 'insensitive' } } },
                    { invoice: { invoice_number: { contains: keyword, mode: 'insensitive' } } },
                    { product: { product_name: { contains: keyword, mode: 'insensitive' } } },
                ];
            }

            // 🧹 Clean up empty relation filters
            if (newQueries.invoice && Object.keys(newQueries.invoice).length === 0) delete newQueries.invoice;
            if (newQueries.pelanggan && Object.keys(newQueries.pelanggan).length === 0) delete newQueries.pelanggan;
            if (!newQueries.product) delete newQueries.product;

            const res = await this._prismaService.payment.findMany({
                where: newQueries,
                include: {
                    invoice: {
                        select: {
                            due_date: true,
                            invoice_number: true,
                            invoice_date: true,
                            total: true,
                            invoice_status: true,
                        }
                    },
                    pelanggan: {
                        select: {
                            id_pelanggan: true,
                            full_name: true,
                            pelanggan_code: true,
                            alamat: true,
                            setting_company: {
                                select: {
                                    id_setting_company: true,
                                    company_name: true,
                                }
                            }
                        }
                    },
                    product: {
                        select: {
                            id_product: true,
                            product_name: true,
                        }
                    }
                },
                orderBy: {
                    id_invoice: 'asc'
                }
            });

            return {
                status: true,
                message: '',
                data: res.map(item => ({
                    id_payment: item.id_payment,
                    id_invoice: item.id_invoice,
                    invoice_number: item.invoice.invoice_number,
                    invoice_date: item.invoice.invoice_date,
                    due_date: item.invoice.due_date,
                    invoice_status: item.invoice.invoice_status,
                    total: item.invoice.total,
                    id_pelanggan: item.id_pelanggan,
                    id_setting_company: item.pelanggan.setting_company.id_setting_company,
                    company_name: item.pelanggan.setting_company.company_name,
                    full_name: item.pelanggan.full_name,
                    alamat: item.pelanggan.alamat,
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
                }))
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
                    message: error.message
                },
                status
            );
        }
    }

    async getById(id_payment: number): Promise<any> {
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
                                due_date: true,
                                price: true,
                                admin_fee: true,
                                invoice_status: true,
                            }
                        },
                        pelanggan: {
                            select: {
                                id_pelanggan: true,
                                full_name: true,
                                pelanggan_code: true,
                                alamat: true,
                                setting_company: {
                                    select: {
                                        id_setting_company: true,
                                        company_name: true,
                                        tagihan_editor_invoice: true,
                                        tagihan_editor_pos: true
                                    }
                                },
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

            if (!res) {
                return {
                    status: false,
                    message: 'Payment Not Found',
                    data: null
                }
            };

            let userInput = "SISTEM";

            if (res.payment_provider != 'XENDIT') {
                let user = await this._prismaService
                    .user
                    .findFirst({
                        where: {
                            id_user: res.create_by
                        },
                        select: {
                            full_name: true
                        }
                    });

                if (user) {
                    userInput = user.full_name;
                } else {
                    userInput = "SISTEM";
                }
            };

            return {
                status: true,
                message: '',
                data: {
                    id_payment: res.id_payment,
                    id_invoice: res.id_invoice,
                    invoice_number: res.invoice.invoice_number,
                    invoice_date: res.invoice.invoice_date,
                    total: res.invoice.total,
                    due_date: res.invoice.due_date,
                    price: res.invoice.price,
                    admin_fee: res.invoice.admin_fee,
                    invoice_status: res.invoice.invoice_status,
                    id_pelanggan: res.id_pelanggan,
                    id_setting_company: res.pelanggan.setting_company.id_setting_company,
                    company_name: res.pelanggan.setting_company.company_name,
                    tagihan_editor_invoice: res.pelanggan.setting_company.tagihan_editor_invoice,
                    tagihan_editor_pos: res.pelanggan.setting_company.tagihan_editor_pos,
                    full_name: res.pelanggan.full_name,
                    pelanggan_code: res.pelanggan.pelanggan_code,
                    alamat: res.pelanggan.alamat,
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
                    user_create: userInput,
                    update_at: res.update_at,
                    update_by: res.update_by,
                    token: this._utilityService.onEncrypt(JSON.stringify({ id_invoice: res.id_invoice }))
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

            if (invoice.status && invoice.data.invoice_status == 'PAID') {
                return {
                    status: false,
                    message: 'Invoice Telah Terbayar',
                    data: null
                }
            }

            const token = this._utilityService.onEncrypt(JSON.stringify({ id_invoice: invoice.data.id_invoice }));

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
            };

            let invoice = await this._invoiceService.getById(parseInt(data.id_invoice ? data.id_invoice : data));

            let checkIsPaymentExist = await this._prismaService
                .payment
                .findFirst({
                    where: {
                        id_invoice: parseInt(data.id_invoice ? data.id_invoice : data),
                    },
                });

            if (!checkIsPaymentExist) {
                return {
                    status: true,
                    data: { ...invoice.data, payment: null, is_payment_generated: false },
                    message: ''
                }
            };

            const userEntry = await this._prismaService.user
                .findFirst({
                    where: {
                        id_user: parseInt(checkIsPaymentExist.create_by as any)
                    }
                });

            if (checkIsPaymentExist.payment_provider != 'MANUAL' && checkIsPaymentExist.payment_method != 'QRIS') {
                const checkExpiredXenditPayload = {
                    method: 'get',
                    url: `${process.env.XENDIT_URL}/callback_virtual_accounts/${checkIsPaymentExist.payment_id}`,
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${invoice.data.api_key_pg}:`).toString('base64')}`
                    }
                };

                const checkExpiredXendit = await firstValueFrom(this._axiosService.onAxiosRequest(checkExpiredXenditPayload));

                if (!checkExpiredXendit.status) {
                    return {
                        status: false,
                        message: 'Payment Not Found',
                        data: null
                    }
                }
            };

            delete invoice.data.api_key_pg;

            return {
                status: true,
                data: {
                    ...invoice.data,
                    payment: {
                        ...checkIsPaymentExist,
                        user_entry: checkIsPaymentExist.create_by == 9999 ? 'SISTEM' : (userEntry ? userEntry.full_name : 'SISTEM')
                    },
                    is_payment_generated: true,
                },
                message: ''
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

    // ** Get Payment Method For Internal
    async getPaymentMethodForInternal(req: Request): Promise<PaymentModel.GetAllPayment> {
        try {
            const settingCompany = await this._prismaService
                .setting_company
                .findUnique({
                    where: {
                        id_setting_company: parseInt(req['user']['id_setting_company'])
                    }
                });

            if (!settingCompany) {
                return {
                    status: false,
                    message: 'Setting Company Not Found',
                    data: null
                }
            };

            const params = {
                method: 'get',
                url: `${process.env.XENDIT_URL}/available_virtual_account_banks`,
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${settingCompany.api_key_pg}:`).toString('base64')}`
                },
            };

            return await firstValueFrom(
                this._axiosService
                    .onAxiosRequest(params)
                    .pipe(
                        map((result) => {
                            result.data = result.data.filter((item: any) => {
                                if (item.country == 'ID' && item.currency == 'IDR' && item.is_activated && item.code.toLowerCase() != 'sahabat_sampoerna') {
                                    return item;
                                }
                            });

                            let newData = [
                                {
                                    payment_method_type: 'QRIS',
                                    payment_method_name: 'QRIS',
                                    payment_method_code: 'QRIS',
                                },
                                ...result.data.map((item: any) => {
                                    return {
                                        payment_method_type: 'Virtual Account',
                                        payment_method_name: item.name,
                                        payment_method_code: item.code,
                                    }
                                })
                            ];

                            return {
                                ...result,
                                data: newData
                            };
                        })
                    )
            );

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

    // ** Get Payment Method
    async getPaymentMethod(token: string): Promise<PaymentModel.GetAllPayment> {
        try {
            const decryptedData = this._utilityService.onDecrypt(token);

            if (!decryptedData) {
                return {
                    status: false,
                    message: 'Token Is Invalid',
                    data: null
                }
            };

            const invoice = await this._invoiceService.getById(parseInt(decryptedData));

            if (!invoice.status) {
                return {
                    status: false,
                    message: 'Invoice Not Found',
                    data: null
                }
            };

            const pelanggan = await this._prismaService
                .pelanggan
                .findUnique({
                    where: {
                        id_pelanggan: invoice.data.id_pelanggan
                    },
                    select: {
                        id_setting_company: true
                    }
                });

            if (!pelanggan) {
                return {
                    status: false,
                    message: 'Pelanggan Not Found',
                    data: null
                }
            };

            const settingCompany = await this._prismaService
                .setting_company
                .findUnique({
                    where: {
                        id_setting_company: pelanggan.id_setting_company
                    }
                });

            if (!settingCompany) {
                return {
                    status: false,
                    message: 'Setting Company Not Found',
                    data: null
                }
            };

            const xendit_payment_method = await this._prismaService
                .xendit_payment_method
                .findMany({
                    where: {
                        is_active: true
                    }
                });

            let newData: any[] = [
                ...xendit_payment_method.map((item: any) => {
                    let admin_fee_after_vat = parseFloat(item.payment_method_fee) + (parseFloat(item.payment_method_fee) * parseFloat(process.env.XENDIT_VAT_FEE));

                    return {
                        payment_method_type: item.payment_method_type,
                        payment_method_name: item.payment_method_name,
                        payment_method_code: item.payment_method_code,
                        payment_method_instruction: this.getPaymentMethodCaraBayar(item.payment_method_code),
                        image: this._imageHelperService.getImageUrl(item.payment_method_code),
                        payment_method_fee: admin_fee_after_vat
                    }
                })
            ];

            return {
                status: true,
                data: newData,
                message: 'OK'
            };

            // const params = {
            //     method: 'get',
            //     url: `${process.env.XENDIT_URL}/available_virtual_account_banks`,
            //     headers: {
            //         'Authorization': `Basic ${Buffer.from(`${settingCompany.api_key_pg}:`).toString('base64')}`
            //     },
            // };

            // return await firstValueFrom(
            //     this._axiosService
            //         .onAxiosRequest(params)
            //         .pipe(
            //             map((result) => {
            //                 result.data = result.data.filter((item: any) => {
            //                     if (item.country == 'ID' && item.currency == 'IDR' && item.is_activated && item.code.toLowerCase() != 'sahabat_sampoerna') {
            //                         return item;
            //                     }
            //                 });

            //                 let newData = [
            //                     {
            //                         payment_method_type: 'QRIS',
            //                         payment_method_name: 'QRIS',
            //                         payment_method_code: 'QRIS',
            //                         image: this._imageHelperService.getImageUrl('QRIS'),
            //                         payment_method_fee: parseFloat(process.env.XENDIT_QR_FEE)
            //                     },
            //                     ...result.data.map((item: any) => {
            //                         return {
            //                             payment_method_type: 'Virtual Account',
            //                             payment_method_name: item.name,
            //                             payment_method_code: item.code,
            //                             payment_method_instruction: this.getPaymentMethodCaraBayar(item.code),
            //                             image: this._imageHelperService.getImageUrl(item.code),
            //                             payment_method_fee: parseFloat(process.env.XENDIT_VA_FEE)
            //                         }
            //                     })
            //                 ];

            //                 return {
            //                     ...result,
            //                     data: newData
            //                 };
            //             })
            //         )
            // );

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

    // ** Change payment method => Update VA, conditionally by payment method
    async changePaymentMethod(token: string) {
        try {
            const data = this._utilityService.onDecrypt(token);

            if (!data) {
                return {
                    status: false,
                    message: 'Token Is Invalid',
                    data: null
                }
            };

            let invoice = await this._invoiceService.getById(parseInt(data.id_invoice ? data.id_invoice : data));

            const checkIsPaymentExist = await this._prismaService
                .payment
                .findFirst({
                    where: {
                        id_invoice: parseInt(data.id_invoice ? data.id_invoice : data),
                    },
                });

            if (checkIsPaymentExist) {
                if (checkIsPaymentExist.payment_method != 'QRIS' && checkIsPaymentExist.payment_provider == 'XENDIT') {
                    const updateVirtualAccountParams = {
                        method: 'patch',
                        url: `${process.env.XENDIT_URL}/callback_virtual_accounts/${checkIsPaymentExist.payment_id}`,
                        headers: {
                            'Authorization': `Basic ${Buffer.from(`${invoice.data.api_key_pg}:`).toString('base64')}`
                        },
                        data: {
                            expiration_date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(),
                        }
                    };

                    const updateExpiredDateVaXendit = await firstValueFrom(this._axiosService.onAxiosRequest(updateVirtualAccountParams));

                    if (!updateExpiredDateVaXendit.status) {
                        return {
                            status: false,
                            message: 'Failed To Update VA Expiration Date',
                            data: null
                        }
                    };
                }

                const updateStatusPayment = await this._prismaService
                    .payment
                    .delete({
                        where: {
                            id_payment: parseInt(checkIsPaymentExist.id_payment as any)
                        }
                    });

                if (!updateStatusPayment) {
                    return {
                        status: false,
                        message: 'Update Payment Method Failed',
                        data: null
                    }
                }
            }

            return {
                status: true,
                data: { ...invoice.data, payment: null as any, is_payment_generated: false, },
                message: ''
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

    // ** Create Checkout -> HIT Create QR / Create VA Bank, if success save to DB using payment function
    async payment(payload: PaymentModel.CreatePayment): Promise<any> {
        try {
            if (payload.payment_method_code == 'BCA' && parseFloat(payload.payment_amount as any) < 10000) {
                return {
                    status: false,
                    message: 'Minimal Transaksi Adalah Rp 10.000,-',
                    data: null
                }
            }

            const decryptedData = this._utilityService.onDecrypt(payload.payment_token);

            if (!decryptedData) {
                return {
                    status: false,
                    message: 'Token Is Invalid',
                    data: null
                }
            };

            const invoice = await this._invoiceService.getById(parseInt(decryptedData));

            if (!invoice.status) {
                return {
                    status: false,
                    message: 'Token Is Invalid',
                    data: null
                }
            }

            const dataFromToken = invoice.data;

            const pelanggan = await this._prismaService
                .pelanggan
                .findUnique({
                    where: {
                        id_pelanggan: invoice.data.id_pelanggan
                    },
                    select: {
                        id_setting_company: true,
                        pelanggan_code: true,
                    }
                });

            if (!pelanggan) {
                return {
                    status: false,
                    message: 'Pelanggan Not Found',
                    data: null
                }
            };

            const settingCompany = await this._prismaService
                .setting_company
                .findUnique({
                    where: {
                        id_setting_company: pelanggan.id_setting_company
                    }
                });

            if (!settingCompany) {
                return {
                    status: false,
                    message: 'Setting Company Not Found',
                    data: null
                }
            };

            const usePgAdminFee = settingCompany.is_use_pg_admin_fee;

            let FEE_AMOUNT = { VA: 0, QR: 0 },
                admin_fee = 0,
                admin_fee_after_vat = 0,
                total_invoice = payload.payment_amount,
                expected_amount = payload.payment_amount;

            if (usePgAdminFee) {
                FEE_AMOUNT = {
                    VA: process.env.XENDIT_VA_FEE ? parseInt(process.env.XENDIT_VA_FEE) : 0,
                    QR: process.env.XENDIT_QR_FEE ? parseFloat(process.env.XENDIT_QR_FEE) : 0,
                };

                admin_fee = payload.payment_method_code == 'QRIS'
                    ? (parseFloat(payload.payment_amount as any) * (FEE_AMOUNT.QR / 100))
                    : FEE_AMOUNT.VA;

                admin_fee_after_vat = admin_fee + (admin_fee * parseFloat(process.env.XENDIT_VAT_FEE));

                expected_amount = total_invoice + admin_fee_after_vat;
            };

            const expired_date = new Date(new Date().getTime() + 1 * 60 * 60 * 1000);

            const createVirtualAccountParams = {
                method: 'post',
                url: `${process.env.XENDIT_URL}/callback_virtual_accounts`,
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${settingCompany.api_key_pg}:`).toString('base64')}`
                },
                data: {
                    external_id: `va_${dataFromToken.invoice_number}`,
                    bank_code: payload.payment_method_code,
                    name: `${dataFromToken.full_name} - ${pelanggan.pelanggan_code}`,
                    country: 'ID',
                    currency: 'IDR',
                    is_single_use: true,
                    is_closed: true,
                    expected_amount: expected_amount,
                    callback_url: process.env.XENDIT_CALLBACK_URL,
                    expiration_date: expired_date.toISOString(),
                }
            };

            const createQrCodesParams = {
                method: 'post',
                url: `${process.env.XENDIT_URL}/qr_codes`,
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${settingCompany.api_key_pg}:`).toString('base64')}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    external_id: `${dataFromToken.invoice_number}_${new Date().getTime()}`,
                    reference_id: dataFromToken.invoice_number,
                    type: 'DYNAMIC',
                    currency: 'IDR',
                    amount: Math.ceil(expected_amount),
                    callback_url: process.env.XENDIT_CALLBACK_URL,
                    expires_at: expired_date.toISOString(),
                }
            };

            let payloadXendit = payload.payment_method_code == 'QRIS' ? createQrCodesParams : createVirtualAccountParams;
            const xenditPaymentResult = await firstValueFrom(this._axiosService.onAxiosRequest(payloadXendit));

            if (!xenditPaymentResult.status) {
                return {
                    status: false,
                    message: 'Checkout Failed, Try Again',
                    data: null
                }
            }

            let res = await this._prismaService
                .payment
                .create({
                    data: {
                        id_invoice: dataFromToken.id_invoice,
                        id_pelanggan: dataFromToken.id_pelanggan,
                        id_product: dataFromToken.id_product,
                        payment_token: payload.payment_token,
                        payment_id: xenditPaymentResult.data.id,
                        payment_number: payload.payment_method_code == 'QRIS' ? xenditPaymentResult.data.qr_string : xenditPaymentResult.data.account_number,
                        payment_date: new Date(),
                        payment_status: payload.payment_method_code == 'QRIS' ? 'PENDING' : xenditPaymentResult.data.status,
                        payment_method: payload.payment_method_code,
                        payment_amount: expected_amount,
                        payment_provider: 'XENDIT',
                        expired_at: expired_date.toISOString(),
                        create_at: new Date(),
                        create_by: dataFromToken.id_pelanggan
                    }
                });

            return {
                status: true,
                message: 'Checkout Success, Waiting Your Payment',
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

    async simulate(id_payment: number): Promise<any> {
        try {
            const payment = await this._prismaService
                .payment
                .findUnique({
                    where: {
                        id_payment: parseInt(id_payment as any)
                    },
                    select: {
                        id_pelanggan: true,
                        payment_id: true,
                        payment_amount: true,
                        payment_method: true,
                        invoice: {
                            select: {
                                total: true
                            }
                        }
                    },
                });

            const pelanggan = await this._prismaService
                .pelanggan
                .findUnique({
                    where: {
                        id_pelanggan: payment.id_pelanggan
                    },
                    select: {
                        id_setting_company: true
                    }
                });

            if (!pelanggan) {
                return {
                    status: false,
                    message: 'Pelanggan Not Found',
                    data: null
                }
            };

            const settingCompany = await this._prismaService
                .setting_company
                .findUnique({
                    where: {
                        id_setting_company: pelanggan.id_setting_company
                    }
                });

            if (!settingCompany) {
                return {
                    status: false,
                    message: 'Setting Company Not Found',
                    data: null
                }
            };

            let virtualAccountXenditId = null;

            if (payment.payment_method != 'QRIS') {
                const getVirtualAccountXendit = {
                    method: 'get',
                    url: `${process.env.XENDIT_URL}/callback_virtual_accounts/${payment.payment_id}`,
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${settingCompany.api_key_pg}:`).toString('base64')}`
                    },
                };

                const getVirtualAccountXenditResult = await firstValueFrom(this._axiosService.onAxiosRequest(getVirtualAccountXendit));

                if (!getVirtualAccountXenditResult.status) {
                    return {
                        status: false,
                        message: 'Payment Not Found',
                        data: null
                    }
                }

                virtualAccountXenditId = getVirtualAccountXenditResult.data.external_id;
            }

            const simulatePaymentVirtualAccountParams = {
                method: 'post',
                url: `${process.env.XENDIT_URL}/callback_virtual_accounts/external_id=${virtualAccountXenditId}/simulate_payment`,
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${settingCompany.api_key_pg}:`).toString('base64')}`
                },
                data: {
                    amount: payment.payment_amount,
                }
            };

            const simulateQrCodesParams = {
                method: 'post',
                url: `${process.env.XENDIT_URL}/qr_codes/${payment.payment_id}/payments/simulate`,
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${settingCompany.api_key_pg}:`).toString('base64')}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    amount: payment.payment_amount
                }
            };

            let payloadXendit = payment.payment_method == 'QRIS' ? simulateQrCodesParams : simulatePaymentVirtualAccountParams;
            const xenditPaymentResult = await firstValueFrom(this._axiosService.onAxiosRequest(payloadXendit));

            if (!xenditPaymentResult.status) {
                return {
                    status: false,
                    message: 'Simulate Failed, Try Again',
                    data: null
                }
            }

            const updatePayment = await this._prismaService
                .payment
                .update({
                    where: {
                        id_payment: parseInt(id_payment as any),
                    },
                    data: {
                        payment_status: 'PAID',
                        update_at: new Date(),
                        update_by: 1,
                    }
                });

            if (!updatePayment) {
                return {
                    status: false,
                    message: 'Update Status Payment Failed',
                    data: null
                }
            };

            let FEE_AMOUNT = { VA: 0, QR: 0 },
                admin_fee = 0,
                admin_fee_after_vat = 0,
                usePgAdminFee = settingCompany.is_use_pg_admin_fee;

            if (usePgAdminFee) {
                FEE_AMOUNT = {
                    VA: process.env.XENDIT_VA_FEE ? parseInt(process.env.XENDIT_VA_FEE) : 0,
                    QR: process.env.XENDIT_QR_FEE ? parseFloat(process.env.XENDIT_QR_FEE) : 0,
                };

                admin_fee = updatePayment.payment_method == 'QRIS'
                    ? (parseFloat(updatePayment.payment_amount as any) * (FEE_AMOUNT.QR / 100))
                    : FEE_AMOUNT.VA;

                admin_fee_after_vat = admin_fee + (admin_fee * parseFloat(process.env.XENDIT_VAT_FEE));
            };

            const updateInvoice = await this._prismaService
                .invoice
                .update({
                    where: {
                        id_invoice: parseInt(updatePayment.id_invoice as any),
                    },
                    data: {
                        invoice_status: 'PAID',
                        admin_fee: parseFloat(admin_fee_after_vat as any),
                        total: parseInt(payment.invoice.total as any) + parseFloat(admin_fee_after_vat as any)
                    }
                });

            if (!updateInvoice) {
                return {
                    status: false,
                    message: 'Update Status Invoice Failed',
                    data: null
                }
            };

            this._appGateway.sendPaymentNotification({ token: updatePayment.payment_token });

            return {
                status: true,
                message: 'Simulate Success, Waiting Callback',
                data: id_payment
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

    async paymentCallback(payload: any): Promise<any> {
        try {
            const paymentMethod = payload.event && payload.event.includes('qr') ? 'QRIS' : 'VA';

            let id = "";

            if (paymentMethod == 'QRIS') {
                id = payload.data ? payload.data.id : payload.qr_code.id;
            };

            if (paymentMethod == 'VA') {
                id = payload.callback_virtual_account_id;
            };

            const payment = await this._prismaService
                .payment
                .findFirst({
                    where: {
                        payment_id: id
                    },
                    include: {
                        invoice: {
                            select: {
                                id_invoice: true,
                                total: true,
                                pelanggan: {
                                    include: {
                                        setting_company: {
                                            select: {
                                                id_setting_company: true,
                                                is_use_pg_admin_fee: true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

            if (!payment) {
                return {
                    status: false,
                    message: 'Payment Not Found',
                    data: null
                }
            }

            const updatePayment = await this._prismaService
                .payment
                .update({
                    where: {
                        id_payment: parseInt(payment.id_payment as any),
                    },
                    data: {
                        payment_status: 'PAID',
                        update_at: new Date(),
                        update_by: 9999,
                    }
                });

            if (!updatePayment) {
                return {
                    status: false,
                    message: 'Update Status Payment Failed',
                    data: null
                }
            };

            const usePgAdminFee = payment.invoice.pelanggan.setting_company.is_use_pg_admin_fee;

            let FEE_AMOUNT = { VA: 0, QR: 0 },
                admin_fee = 0,
                admin_fee_after_vat = 0;

            if (usePgAdminFee) {
                FEE_AMOUNT = {
                    VA: process.env.XENDIT_VA_FEE ? parseInt(process.env.XENDIT_VA_FEE) : 0,
                    QR: process.env.XENDIT_QR_FEE ? parseFloat(process.env.XENDIT_QR_FEE) : 0,
                };

                admin_fee = updatePayment.payment_method == 'QRIS'
                    ? (parseFloat(updatePayment.payment_amount as any) * (FEE_AMOUNT.QR / 100))
                    : FEE_AMOUNT.VA;

                admin_fee_after_vat = admin_fee + (admin_fee * parseFloat(process.env.XENDIT_VAT_FEE));
            };

            const updateInvoice = await this._prismaService
                .invoice
                .update({
                    where: {
                        id_invoice: parseInt(updatePayment.id_invoice as any),
                    },
                    data: {
                        invoice_status: 'PAID',
                        admin_fee: parseFloat(admin_fee_after_vat as any),
                        total: parseInt(payment.invoice.total as any) + admin_fee_after_vat
                    }
                });

            if (!updateInvoice) {
                return {
                    status: false,
                    message: 'Update Status Invoice Failed',
                    data: null
                }
            };

            const sendMessage = await this.sendMessage({ user: { id_setting_company: payment.invoice.pelanggan.id_setting_company } } as any, payment.id_payment);

            if (!sendMessage.status) {
                return {
                    status: false,
                    message: 'Gagal Mengirimkan Pesan Lunas',
                    data: null
                }
            };

            this._appGateway.sendPaymentNotification({ token: updatePayment.payment_token });

            return {
                status: true,
                message: 'Payment Success',
                data: payload
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

    async editPayment(req: Request, payload: PaymentModel.UpdatePayment): Promise<any> {
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

    private getPaymentMethodCaraBayar(payment_method_code: string) {
        let payment_method_instructions = [];

        if (payment_method_code == 'MANDIRI') {
            payment_method_instructions.push(
                {
                    type: 'ATM',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: TEMUKAN ATM TERDEKAT</p>
                            <ol>
                                <li>Masukkan ATM dan tekan <strong>"Bahasa Indonesia"</strong></li>
                                <li>Masukkan PIN, lalu tekan <strong>"Benar"</strong></li>
                                <li>Pilih <strong>"Pembayaran"</strong>, lalu pilih <strong>"Multi Payment"</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Masukkan kode perusahaan <strong>'88908'</strong> (<strong>88908 XENDIT</strong>) untuk closed amount VA dan <strong>‘88608’</strong> (<strong>88608 XENDIT</strong>) untuk open amount VA, lalu tekan <strong>"BENAR"</strong></li>
                                <li>Masukkan Nomor Virtual Account <strong>88908988586665460</strong> (contoh), lalu tekan <strong>"BENAR"</strong></li>
                                <li>Untuk open amount VA, masukkan nominal yang ingin di transfer, lalu tekan <strong>"BENAR"</strong></li>
                                <li>Informasi pelanggan akan ditampilkan, pilih nomor <strong>1</strong> sesuai dengan nominal pembayaran kemudian tekan <strong>"YA"</strong></li>
                                <li>Konfirmasi pembayaran akan muncul, tekan <strong>"YES"</strong>, untuk melanjutkan</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Simpan bukti transaksi anda</li>
                                <li>Transaksi anda berhasil</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Internet Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Buka situs Mandiri Internet Banking <a href="https://ibank.bankmandiri.co.id" target="_blank">https://ibank.bankmandiri.co.id</a></li>
                                <li>Masuk menggunakan <strong>USER ID</strong> dan <strong>PASSWORD</strong> anda</li>
                                <li>Buka halaman beranda, kemudian pilih <strong>"Pembayaran"</strong></li>
                                <li>Pilih <strong>"Multi Payment"</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih <strong>88908 XENDIT</strong> (untuk closed VA) dan <strong>88608 XENDIT</strong> (untuk open VA) sebagai penyedia jasa</li>
                                <li>Masukkan Nomor Virtual Account <strong>88908988586665460</strong> (contoh)</li>
                                <li>Lalu pilih <strong>"Lanjut"</strong></li>
                                <li>Apabila semua detail benar tekan <strong>"KONFIRMASI"</strong></li>
                                <li>Masukkan <strong>PIN / Challenge Code Token</strong></li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Setelah transaksi pembayaran Anda selesai, simpan bukti pembayaran</li>
                                <li>Invoice ini akan diperbarui secara otomatis. Ini bisa memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                `
                },
                {
                    type: 'Mobile Banking (New Livin by Mandiri - Yellow)',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Buka aplikasi <strong>Livin by Mandiri</strong>, masukkan <strong>PASSWORD</strong> atau lakukan verifikasi wajah</li>
                                <li>Pilih menu <strong>"IDR Transfer"</strong></li>
                                <li>Pilih <strong>“Transfer to new recipient”</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Masukkan Nomor Virtual Account <strong>88908988586665460</strong> (contoh)</li>
                                <li>Konfirmasi detail VA dan klik <strong>“Continue”</strong></li>
                                <li>Masukkan nominal yang ingin dibayarkan (Jika VA merupakan closed VA, maka nominal akan otomatis terisi)</li>
                                <li>Tinjau dan konfirmasi detail transaksi anda, lalu klik <strong>“Continue”</strong></li>
                                <li>Selesaikan transaksi dengan memasukkan <strong>MPIN</strong> anda</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Setelah transaksi pembayaran Anda selesai, simpan bukti pembayaran</li>
                                <li>Invoice ini akan diperbarui secara otomatis</li>
                            </ol>
                        </div>
                   `
                },
            )
        };

        if (payment_method_code == 'BRI') {
            payment_method_instructions.push(
                {
                    type: 'ATM',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: TEMUKAN ATM TERDEKAT</p>
                            <ol>
                                <li>Masukkan kartu, kemudian pilih bahasa dan masukkan <strong>PIN</strong> anda</li>
                                <li>Pilih <strong>"Transaksi Lain"</strong> dan pilih <strong>"Pembayaran"</strong></li>
                                <li>Pilih menu <strong>"Lainnya"</strong> dan pilih <strong>"Briva"</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Masukkan Nomor Virtual Account dan jumlah yang ingin anda bayarkan</li>
                                <li>Periksa data transaksi dan tekan <strong>"YA"</strong></li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Internet Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Buka situs <a href="https://ib.bri.co.id/ib-bri/" target="_blank">https://ib.bri.co.id/ib-bri/</a>, dan masukkan <strong>USER ID</strong> dan <strong>PASSWORD</strong> anda</li>
                                <li>Pilih <strong>"Pembayaran"</strong> dan pilih <strong>"Briva"</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Masukkan Nomor Virtual Account dan jumlah yang ingin anda bayarkan</li>
                                <li>Masukkan <strong>password</strong> anda kemudian masukkan <strong>mToken internet banking</strong></li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                `
                },
                {
                    type: 'Mobile Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Buka aplikasi <strong>BRI Mobile Banking</strong>, masukkan <strong>USER ID</strong> dan <strong>PIN</strong> anda</li>
                                <li>Pilih <strong>"Pembayaran"</strong> dan pilih <strong>"Briva"</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Masukkan Nomor Virtual Account anda dan jumlah yang ingin anda bayarkan</li>
                                <li>Masukkan <strong>PIN Mobile Banking BRI</strong></li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                   `
                },
            )
        };

        if (payment_method_code == 'BNI') {
            payment_method_instructions.push(
                {
                    type: 'ATM',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: TEMUKAN ATM TERDEKAT</p>
                            <ol>
                                <li>Masukkan kartu ATM anda</li>
                                <li>Pilih bahasa</li>
                                <li>Masukkan <strong>PIN ATM</strong> anda</li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih <strong>"Menu Lainnya"</strong></li>
                                <li>Pilih <strong>"Transfer"</strong></li>
                                <li>Pilih jenis rekening yang akan anda gunakan (contoh: <strong>"Dari Rekening Tabungan"</strong>)</li>
                                <li>Pilih <strong>"Virtual Account Billing"</strong></li>
                                <li>Masukkan Nomor Virtual Account anda contoh: <strong>8808988556620621</strong></li>
                                <li>Tagihan yang harus dibayarkan akan muncul pada layar konfirmasi</li>
                                <li>Konfirmasi, apabila telah sesuai, lanjutkan transaksi</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Internet Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Buka situs <a href="https://ibank.bni.co.id" target="_blank">https://ibank.bni.co.id</a></li>
                                <li>Masukkan <strong>User ID</strong> dan <strong>Password</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih menu <strong>"Transfer"</strong></li>
                                <li>Pilih menu <strong>"Virtual Account Billing"</strong></li>
                                <li>Masukkan Nomor Virtual Account contoh: <strong>8808988556620621</strong></li>
                                <li>Lalu pilih rekening debet yang akan digunakan. Kemudian tekan <strong>"Lanjut"</strong></li>
                                <li>Tagihan yang harus dibayarkan akan muncul pada layar konfirmasi</li>
                                <li>Masukkan <strong>Kode Otentikasi Token</strong></li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                `
                },
                {
                    type: 'Mobile Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Akses <strong>BNI Mobile Banking</strong> melalui handphone</li>
                                <li>Masukkan <strong>User ID</strong> dan <strong>Password</strong></li>
                                <li>Pilih menu <strong>"Transfer"</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih menu <strong>"Virtual Account Billing"</strong>, lalu pilih rekening debet</li>
                                <li>Masukkan Nomor Virtual Account anda contoh: <strong>8808988556620621</strong> pada menu <strong>"Input Baru"</strong></li>
                                <li>Tagihan yang harus dibayarkan akan muncul pada layar konfirmasi</li>
                                <li>Konfirmasi transaksi dan masukkan <strong>Password Transaksi</strong></li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                   `
                },
            )
        };

        if (payment_method_code == 'BCA') {
            payment_method_instructions.push(
                {
                    type: 'ATM',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: TEMUKAN ATM TERDEKAT</p>
                            <ol>
                                <li>Masukkan <strong>Kartu ATM BCA</strong></li>
                                <li>Masukkan <strong>PIN</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih menu <strong>"Transaksi Lainnya"</strong></li>
                                <li>Pilih menu <strong>"Transfer"</strong></li>
                                <li>Pilih menu <strong>"ke Rekening BCA Virtual Account"</strong></li>
                                <li>Masukkan Nomor Virtual Account Anda contoh: <strong>700701598855309526</strong>. Tekan <strong>"Benar"</strong> untuk melanjutkan</li>
                                <li>Di halaman konfirmasi, pastikan detil pembayaran sudah sesuai seperti No VA, Nama, Perus/Produk dan Total Tagihan, tekan <strong>"Benar"</strong> untuk melanjutkan</li>
                                <li>Tekan <strong>"Ya"</strong> jika sudah benar</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Internet Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Lakukan log in pada aplikasi <strong>KlikBCA Individual</strong> <a href="https://ibank.klikbca.com" target="_blank">https://ibank.klikbca.com</a></li>
                                <li>Masukkan <strong>User ID</strong> dan <strong>PIN</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih <strong>"Transfer Dana"</strong>, kemudian pilih <strong>"Transfer ke BCA Virtual Account"</strong></li>
                                <li>Masukkan Nomor Virtual Account contoh: <strong>700701598855309526</strong></li>
                                <li>Pilih <strong>"Lanjutkan"</strong></li>
                                <li>Masukkan <strong>"RESPON KEYBCA APPLI 1"</strong> yang muncul pada Token BCA anda, kemudian tekan tombol <strong>"Kirim"</strong></li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Mobile Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Buka aplikasi <strong>BCA Mobile</strong></li>
                                <li>Pilih menu <strong>"m-BCA"</strong>, kemudian masukkan kode akses m-BCA</li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih <strong>"Transaction"</strong> lalu pilih <strong>"m-Transfer"</strong>, kemudian pilih <strong>"BCA Virtual Account"</strong></li>
                                <li>Masukkan Nomor Virtual Account anda contoh: <strong>700701598855309526</strong>, kemudian tekan <strong>"OK"</strong></li>
                                <li>Tekan tombol <strong>"Kirim"</strong> yang berada di sudut kanan atas aplikasi untuk melakukan transfer</li>
                                <li>Tekan <strong>"OK"</strong> untuk melanjutkan pembayaran</li>
                                <li>Masukkan <strong>PIN</strong> Anda untuk meng-otorisasi transaksi</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
            )
        };

        if (payment_method_code == 'PERMATA') {
            payment_method_instructions.push(
                {
                    type: 'ATM',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: TEMUKAN ATM TERDEKAT</p>
                            <ol>
                                <li>Masukkan kartu <strong>ATM Permata</strong> anda</li>
                                <li>Masukkan <strong>PIN</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih menu <strong>"Transaksi Lainnya"</strong></li>
                                <li>Pilih menu <strong>"Pembayaran"</strong></li>
                                <li>Pilih menu <strong>"Pembayaran Lainnya"</strong></li>
                                <li>Pilih menu <strong>"Virtual Account"</strong></li>
                                <li>Masukkan Nomor Virtual Account <strong>contoh : 7293988549175775</strong></li>
                                <li>Lalu pilih rekening debet yang akan digunakan</li>
                                <li>Konfirmasi detail transaksi anda (contoh: Rekening tabungan)</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Internet Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Buka situs <a href="https://new.permatanet.com" target="_blank">https://new.permatanet.com</a></li>
                                <li>Masukkan <strong>User ID</strong> dan <strong>Password</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih <strong>"Pembayaran Tagihan"</strong></li>
                                <li>Pilih <strong>"Virtual Account"</strong></li>
                                <li>Masukkan Nomor Virtual Account <strong>contoh : 7293988549175775</strong></li>
                                <li>Periksa kembali detail pembayaran anda</li>
                                <li>Masukkan otentikasi transaksi/token</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Mobile Banking',
                    instructions: `
                       <div>
                        <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                        <ol>
                            <li>Buka aplikasi <strong>Permata Mobile Internet</strong></li>
                            <li>Masukkan <strong>User ID</strong> dan <strong>Password</strong></li>
                        </ol>

                        <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                        <ol>
                            <li>Pilih <strong>"Bayar Tagihan"</strong></li>
                            <li>Pilih <strong>"Virtual Account"</strong></li>
                            <li>Masukkan Nomor Virtual Account Anda <strong>contoh : 7293988549175775</strong></li>
                            <li>Masukkan otentikasi transaksi/token</li>
                        </ol>

                        <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                        <ol>
                            <li>Transaksi Anda telah selesai</li>
                            <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                        </ol>
                    </div>
                    `
                },
            )
        };

        if (payment_method_code == 'BSI') {
            payment_method_instructions.push(
                {
                    type: 'ATM',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: TEMUKAN ATM BSI TERDEKAT</p>
                            <ol>
                                <li>Masukkan kartu ATM BSI anda</li>
                                <li>Masukkan PIN</li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih menu <strong>"Pembayaran/Pembelian"</strong></li>
                                <li>Pilih menu <strong>"Institusi"</strong></li>
                                <li>Masukkan kode BSI VA Nomor Virtual Account <strong>Contoh: 9347xxxxxxxxxx</strong></li>
                                <li>Detail yang ditampilkan: <strong>NIM, Nama, & Total Tagihan</strong></li>
                                <li>Konfirmasi detail transaksi anda</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Internet Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Buka situs <a href="https://bsinet.bankbsi.co.id" target="_blank">https://bsinet.bankbsi.co.id</a></li>
                                <li>Masukkan <strong>User ID</strong> dan <strong>Password</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih Menu <strong>"Pembayaran"</strong></li>
                                <li>Pilih Nomor Rekening BSI Anda</li>
                                <li>Pilih menu <strong>"Institusi"</strong></li>
                                <li>Masukkan nama institusi <strong>Xendit</strong> (kode <strong>9347</strong>)</li>
                                <li>Masukkan Nomor Virtual Account tanpa diikuti kode institusi (tanpa 4 digit pertama) Contoh: <strong>988619428280</strong></li>
                                <li>Konfirmasi detail transaksi anda</li>
                                <li>Masukkan otentikasi transaksi/token</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Mobile Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Buka aplikasi <strong>BSI Mobile</strong></li>
                                <li>Masukkan <strong>User ID</strong> dan <strong>Password</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih Menu <strong>"Pembayaran"</strong></li>
                                <li>Pilih Nomor Rekening BSI Anda</li>
                                <li>Pilih menu <strong>"Institusi"</strong></li>
                                <li>Masukkan nama institusi <strong>Xendit</strong> (kode <strong>9347</strong>)</li>
                                <li>Masukkan Nomor Virtual Account tanpa diikuti kode institusi Contoh: <strong>988619428280</strong></li>
                                <li>Konfirmasi detail transaksi anda</li>
                                <li>Masukkan otentikasi transaksi/token</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
            )
        };

        if (payment_method_code == 'BJB') {
            payment_method_instructions.push(
                {
                    type: 'ATM',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: TEMUKAN ATM TERDEKAT</p>
                            <ol>
                                <li>Masukkan kartu ATM <strong>BJB</strong> anda</li>
                                <li>Masukkan <strong>PIN</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih menu <strong>"Transaksi Lainnya"</strong></li>
                                <li>Pilih menu <strong>"Virtual Account"</strong></li>
                                <li>Lalu pilih rekening debet yang akan digunakan</li>
                                <li>Masukkan Nomor Virtual Account: <strong>1234012139123484</strong></li>
                                <li>Konfirmasi detail transaksi anda</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Internet Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: TEMUKAN ATM TERDEKAT</p>
                            <ol>
                                <li>Buka halaman <a href="https://ib.bankbjb.co.id/bjb.net" target="_blank">https://ib.bankbjb.co.id/bjb.net</a></li>
                                <li>Masukkan <strong>User ID</strong> dan <strong>Password</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih menu <strong>"Virtual Account"</strong></li>
                                <li>Lalu pilih rekening debet yang akan digunakan</li>
                                <li>Masukkan Nomor Virtual Account: <strong>1234012139123484</strong></li>
                                <li>Konfirmasi detail transaksi anda</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Mobile Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: TEMUKAN ATM TERDEKAT</p>
                            <ol>
                                <li>Buka aplikasi <strong>BJB Mobile</strong></li>
                                <li>Masukkan <strong>User ID</strong> dan <strong>Password</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih menu <strong>"Virtual Account"</strong></li>
                                <li>Lalu pilih rekening debet yang akan digunakan</li>
                                <li>Masukkan Nomor Virtual Account: <strong>1234012139123484</strong></li>
                                <li>Konfirmasi detail transaksi anda</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
            )
        };

        if (payment_method_code == 'CIMB') {
            payment_method_instructions.push(
                {
                    type: 'ATM',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: TEMUKAN ATM TERDEKAT</p>
                            <ol>
                                <li>Masukkan kartu ATM anda</li>
                                <li>Pilih bahasa</li>
                                <li>Masukkan PIN ATM anda</li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih menu <strong>"Transfer"</strong> dan lalu pilih <strong>"Other CIMB Niaga"</strong></li>
                                <li>Masukkan Nomor Virtual Account Anda: <strong>9349988556620621</strong> (contoh) pada menu <strong>"Input New"</strong></li>
                                <li>Masukkan nominal yang harus dibayarkan</li>
                                <li>Konfirmasi transaksi dan masukkan Password Transaksi</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Internet Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Buka situs <a href="https://www.octoclicks.co.id/login/" target="_blank">https://www.octoclicks.co.id/login/</a></li>
                                <li>Masukkan User ID dan Password</li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih menu <strong>"Transfer"</strong> dan lalu pilih <strong>"Other CIMB Niaga"</strong></li>
                                <li>Masukkan Nomor Virtual Account Anda: <strong>9349988556620621</strong> (contoh) pada menu <strong>"Input New"</strong></li>
                                <li>Masukkan nominal yang harus dibayarkan</li>
                                <li>Konfirmasi transaksi dan masukkan Password Transaksi</li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diupdate secara otomatis. Proses ini mungkin memakan waktu hingga 5 menit</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'Mobile Banking',
                    instructions: `
                        <div>
                            <p>LANGKAH 1: MASUK KE AKUN ANDA</p>
                            <ol>
                                <li>Akses <strong>Octo Mobile</strong> melalui handphone</li>
                                <li>Masukkan <strong>User ID</strong> dan <strong>Password</strong></li>
                            </ol>

                            <p>LANGKAH 2: DETAIL PEMBAYARAN</p>
                            <ol>
                                <li>Pilih menu <strong>"Transfer"</strong> dan lalu pilih <strong>"Other CIMB Niaga"</strong></li>
                                <li>Masukkan Nomor Virtual Account Anda: <strong>9349988556620621</strong> (contoh) pada menu <strong>"Input New"</strong></li>
                                <li>Masukkan nominal yang harus dibayarkan</li>
                                <li>Konfirmasi transaksi dan masukkan <strong>Password Transaksi</strong></li>
                            </ol>

                            <p>LANGKAH 3: TRANSAKSI BERHASIL</p>
                            <ol>
                                <li>Transaksi Anda telah selesai</li>
                                <li>Setelah transaksi anda selesai, invoice ini akan diperbarui secara otomatis. Proses ini mungkin memakan waktu hingga <strong>5 menit</strong></li>
                            </ol>
                        </div>
                    `
                },
            )
        };

        return payment_method_instructions;
    }

    async sendMessage(req: Request, id_payment: any): Promise<any> {
        try {
            const payment = await this._prismaService
                .payment
                .findUnique({
                    where: {
                        id_payment: parseInt(id_payment as any)
                    }
                })

            const invoice = await this._prismaService
                .invoice
                .findUnique({
                    where: {
                        id_invoice: parseInt(payment.id_invoice as any)
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

            return await this._channelProviderRouterService.handleSendMessage(req, 'PAYMENT', invoice);

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

    async paymentCash(req: Request, payload: PaymentModel.CreatePaymentCash): Promise<any> {
        try {
            const invoice = await this._invoiceService.getById(parseInt(payload.id_invoice as any));

            if (!invoice.status) {
                return {
                    status: false,
                    message: 'Invoice Not Found',
                    data: null
                }
            }

            if (invoice.data.invoice_status == 'PAID') {
                return {
                    status: false,
                    message: 'Invoice Sudah Terbayar',
                    data: null
                }
            };

            const existingPaymentXendit = await this._prismaService
                .payment
                .findFirst({
                    where: {
                        id_invoice: parseInt(payload.id_invoice as any),
                        payment_provider: 'XENDIT',
                        payment_status: 'PENDING'
                    }
                });

            if (existingPaymentXendit) {
                await this._prismaService
                    .payment
                    .delete({
                        where: {
                            id_payment: parseInt(existingPaymentXendit.id_payment as any)
                        }
                    });
            }

            const dataFromToken = invoice.data;

            const paymentMethodManual = await this._prismaService
                .payment_method_manual
                .findFirst({
                    where: {
                        id_payment_method_manual: parseInt(payload.id_payment_method_manual as any)
                    }
                });

            let res = await this._prismaService
                .payment
                .create({
                    data: {
                        id_invoice: dataFromToken.id_invoice,
                        id_pelanggan: dataFromToken.id_pelanggan,
                        id_product: dataFromToken.id_product,
                        payment_token: "MANUAL",
                        payment_id: `${paymentMethodManual.payment_method}-${dataFromToken.invoice_number}`,
                        payment_number: paymentMethodManual.no_rekening,
                        payment_date: new Date(payload.payment_date),
                        payment_status: "PAID",
                        payment_method: paymentMethodManual.payment_method,
                        payment_amount: dataFromToken.total,
                        payment_provider: "MANUAL",
                        create_at: new Date(),
                        create_by: parseInt(req['user']['id_user'])
                    }
                });

            if (!res.id_payment) {
                return {
                    status: false,
                    message: 'Pembayaran Gagal Disimpan',
                    data: null
                }
            };

            let resUpdateInvoice = await this._prismaService
                .invoice
                .update({
                    where: {
                        id_invoice: parseInt(payload.id_invoice as any)
                    },
                    data: {
                        invoice_status: 'PAID',
                        update_at: new Date(),
                        update_by: parseInt(req['user']['id_user'])
                    }
                });

            if (!resUpdateInvoice) {
                return {
                    status: false,
                    message: 'Status Invoice Gagal Diperbarui',
                    data: null
                }
            };

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

    async cancel(req: Request, id_payment: number): Promise<any> {
        try {
            const payment = await this._prismaService
                .payment
                .findUnique({
                    where: {
                        id_payment: parseInt(id_payment as any)
                    },
                    select: {
                        payment_status: true
                    }
                });

            if (!payment) {
                return {
                    status: false,
                    message: 'Data Payment Tidak Ditemukan',
                    data: null
                }
            }

            if (payment.payment_status == 'PAID') {
                const updatePaymentStatus = await this._prismaService
                    .payment
                    .update({
                        where: {
                            id_payment: parseInt(id_payment as any)
                        },
                        data: {
                            payment_status: 'CANCELED',
                            update_at: new Date(),
                            update_by: parseInt(req['user']['id_user'] as any)
                        }
                    });

                if (!updatePaymentStatus) {
                    return {
                        status: false,
                        message: 'Update Status Payment Failed',
                        data: null
                    }
                }

                const updateInvoiceStatus = await this._prismaService
                    .invoice
                    .update({
                        where: {
                            id_invoice: parseInt(updatePaymentStatus.id_invoice as any)
                        },
                        data: {
                            invoice_status: 'PENDING',
                            update_at: new Date(),
                            update_by: parseInt(req['user']['id_user'] as any)
                        }
                    });

                if (!updateInvoiceStatus) {
                    return {
                        status: false,
                        message: 'Update Status Invoice Failed',
                        data: null
                    }
                }
            }

            if (payment.payment_status == 'PENDING') {
                const updatePaymentStatus = await this._prismaService
                    .payment
                    .update({
                        where: {
                            id_payment: parseInt(id_payment as any)
                        },
                        data: {
                            payment_status: 'CANCELED',
                            update_at: new Date(),
                            update_by: parseInt(req['user']['id_user'] as any)
                        }
                    });

                if (!updatePaymentStatus) {
                    return {
                        status: false,
                        message: 'Update Status Payment Failed',
                        data: null
                    }
                }
            }

            if (payment.payment_status == 'CANCELED') {
                return {
                    status: false,
                    message: 'Status Payment Sudah Dibatalkan',
                    data: null
                }
            }

            return {
                status: true,
                message: 'Ubah Status Payment Berhasil',
                data: id_payment
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
