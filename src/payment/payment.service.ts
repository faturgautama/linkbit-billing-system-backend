import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaymentModel } from './payment.model';
import { InvoiceService } from 'src/invoice/invoice.service';
import { UtilityService } from 'src/utility/utility.service';
import { Request } from 'express';
import { SettingCompanyService } from 'src/setting-company/setting-company.service';
import { AxiosService } from 'src/utility/axios.service';
import { firstValueFrom, map } from 'rxjs';
import { ImageHelperService } from 'src/utility/image-helper.service';
import { AppGateway } from 'src/app.gateway';

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
    ) { }

    async getAll(req: Request, query: PaymentModel.IPaymentQueryParams): Promise<PaymentModel.GetAllPayment> {
        try {
            let queries: any = {
                ...query,
                is_deleted: false
            };

            const setting_company = await this._settingCompanyService.getById(parseInt(req['user']['id_setting_company']));

            if (setting_company.status) {
                // ** Queries id_setting_company for main office
                if (!setting_company.data.is_cabang && !setting_company.data.is_mitra) {
                    if (query.id_setting_company) {
                        queries.pelanggan = {
                            id_setting_company: parseInt(query.id_setting_company)
                        }
                    }
                };

                // ** Queries id_setting_company
                if (setting_company.data.is_cabang || setting_company.data.is_mitra) {
                    queries.pelanggan = {
                        id_setting_company: parseInt(setting_company.data.id_setting_company as any)
                    }
                };
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
                        id_setting_company: item.pelanggan.setting_company.id_setting_company,
                        company_name: item.pelanggan.setting_company.company_name,
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
                    id_setting_company: res.pelanggan.setting_company.id_setting_company,
                    company_name: res.pelanggan.setting_company.company_name,
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

            if (invoice.status && invoice.data.invoice_status == 'PAID') {
                return {
                    status: false,
                    message: 'Invoice Telah Terbayar',
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

            const pelanggan = await this._prismaService
                .pelanggan
                .findUnique({
                    where: {
                        id_pelanggan: JSON.parse(decryptedData).id_pelanggan
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
                                    image: this._imageHelperService.getBase64Image('qris.png')
                                },
                                ...result.data.map((item: any) => {
                                    return {
                                        payment_method_type: 'Virtual Account',
                                        payment_method_name: item.name,
                                        payment_method_code: item.code,
                                        image: this._imageHelperService.getBase64Image(item.code.toLowerCase() + '.png')
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

    // ** Change payment method => Update VA, conditionally by payment method

    // ** Create Checkout -> HIT Create QR / Create VA Bank, if success save to DB using payment function
    async payment(payload: PaymentModel.CreatePayment): Promise<any> {
        try {
            const decryptedData = this._utilityService.onDecrypt(payload.payment_token);

            if (!decryptedData) {
                return {
                    status: false,
                    message: 'Token Is Invalid',
                    data: null
                }
            };

            const dataFromToken = JSON.parse(decryptedData)

            const pelanggan = await this._prismaService
                .pelanggan
                .findUnique({
                    where: {
                        id_pelanggan: JSON.parse(decryptedData).id_pelanggan
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

            const createVirtualAccountParams = {
                method: 'post',
                url: `${process.env.XENDIT_URL}/callback_virtual_accounts`,
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${settingCompany.api_key_pg}:`).toString('base64')}`
                },
                data: {
                    external_id: `va_${dataFromToken.invoice_number}`,
                    bank_code: payload.payment_method_code,
                    name: dataFromToken.full_name,
                    country: 'ID',
                    currency: 'IDR',
                    is_single_use: true,
                    is_closed: true,
                    expected_amount: payload.payment_amount,
                    callback_url: process.env.XENDIT_CALLBACK_URL
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
                    amount: payload.payment_amount,
                    callback_url: process.env.XENDIT_CALLBACK_URL
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
                        payment_status: xenditPaymentResult.data.status,
                        payment_method: payload.payment_method_code,
                        payment_amount: payload.payment_amount,
                        payment_provider: 'XENDIT',
                        create_at: new Date(),
                        create_by: dataFromToken.id_pelanggan
                    }
                })

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
                    }
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

            const simulatePaymentVirtualAccountParams = {
                method: 'post',
                url: `${process.env.XENDIT_URL}/callback_virtual_accounts/external_id=${payment.payment_id}/simulate_payment`,
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
            console.log("payload callback =>", payload);

            const payment = await this._prismaService
                .payment
                .findFirst({
                    where: {
                        id_payment: payload.event ? payload.data.id : payload.payment_id
                    }
                });

            if (!payment) {
                return {
                    status: true,
                    message: 'Payment Not Found',
                    data: payload
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
                        update_by: 1,
                    }
                });

            if (!updatePayment) {
                return {
                    status: true,
                    message: 'Update Status Payment Failed',
                    data: payload
                }
            };

            this._appGateway.sendPaymentNotification(updatePayment.payment_token);

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
}
