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

            console.log("data =>", data);

            let invoice = await this._invoiceService.getById(parseInt(data.id_invoice ? data.id_invoice : data));

            const checkIsPaymentExist = await this._prismaService
                .payment
                .findFirst({
                    where: {
                        id_invoice: parseInt(data.id_invoice ? data.id_invoice : data)
                    },
                    include: {
                        invoice: {
                            include: {
                                pelanggan: {
                                    include: {
                                        setting_company: true
                                    }
                                }
                            }
                        }
                    }
                });

            if (!checkIsPaymentExist) {
                return {
                    status: true,
                    data: { ...invoice.data, payment: null, is_payment_generated: false },
                    message: ''
                }
            };

            const checkExpiredXenditPayload = {
                method: 'get',
                url: `${process.env.XENDIT_URL}/callback_virtual_accounts/payment_id=${checkIsPaymentExist.payment_id}`,
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${checkIsPaymentExist.invoice.pelanggan.setting_company.api_key_pg}:`).toString('base64')}`
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

            console.log("va xendit =>", checkExpiredXendit)

            return {
                status: true,
                data: { ...invoice.data, payment: checkIsPaymentExist, is_payment_generated: true, },
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

            const invoice = await this._invoiceService.getById(parseInt(decryptedData.id_invoice));

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
                                        payment_method_instruction: this.getPaymentMethodCaraBayar(item.code),
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

            const invoice = await this._invoiceService.getById(parseInt(decryptedData.id_invoice));

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
                    external_id: `${dataFromToken.invoice_number}`,
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

            const updateInvoice = await this._prismaService
                .invoice
                .update({
                    where: {
                        id_invoice: parseInt(updatePayment.id_invoice as any),
                    },
                    data: {
                        invoice_status: 'PAID',
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

            const updateInvoice = await this._prismaService
                .invoice
                .update({
                    where: {
                        id_invoice: parseInt(updatePayment.id_invoice as any),
                    },
                    data: {
                        invoice_status: 'PAID',
                    }
                });

            if (!updateInvoice) {
                return {
                    status: false,
                    message: 'Update Status Invoice Failed',
                    data: null
                }
            };

            const sendMessage = await this.sendMessage(payment.id_payment);

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

    async sendMessage(id_payment: any): Promise<any> {
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

            const token = this._utilityService.onEncrypt(JSON.stringify(payment.id_invoice));

            const messageVariable = {
                full_name: invoice.pelanggan.full_name,
                pelanggan_code: invoice.pelanggan.pelanggan_code,
                product_name: invoice.product.product_name,
                invoice_date: this._utilityService.onFormatDate(new Date(invoice.invoice_date), 'MMM yyyy'),
                invoice_number: invoice.invoice_number,
                total: this._utilityService.onFormatCurrency(invoice.total),
                invoice_url: `${process.env.CHECKOUT_URL}/paid?token=${token}`,
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
                url: `${process.env.MPWA_URL}/send-message`,
                params: {
                    api_key: `KVypyzJ0xqMVCnDIgvh8a2HKZGXK1V`,
                    sender: invoice.pelanggan.setting_company.company_whatsapp,
                    number: invoice.pelanggan.whatsapp,
                    message: messageText,
                }
            };

            const mpwaSendMessageResult = await firstValueFrom(this._axiosService.onAxiosRequest(payloadSendMessageMpwa));

            if (!mpwaSendMessageResult.status) {
                await this._prismaService
                    .log_whatsapp_message
                    .create({
                        data: {
                            id_transaksi: payment.id_payment,
                            id_setting_company: invoice.pelanggan.id_setting_company,
                            additional_info: payment,
                            sent_at: new Date(),
                            sent_by: payment.create_by,
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
                        id_transaksi: payment.id_payment,
                        id_setting_company: invoice.pelanggan.id_setting_company,
                        additional_info: payment,
                        sent_at: new Date(),
                        sent_by: payment.create_by,
                        status: 'SUCCESS'
                    }
                })

            return {
                status: true,
                message: 'Pesan lunas berhasil dikirimkan',
                data: id_payment,
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
}
