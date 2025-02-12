import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { InvoiceModel } from './invoice.model';
import { Request, Response } from 'express';
import { SettingCompanyService } from 'src/setting-company/setting-company.service';

@Injectable({ scope: Scope.TRANSIENT })
export class InvoiceService {

    constructor(
        private _prismaService: PrismaService,
        private _settingCompanyService: SettingCompanyService,
    ) { }

    async getAll(req: Request, query: InvoiceModel.IInvoiceQueryParams): Promise<InvoiceModel.GetAllInvoice> {
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
                .invoice
                .findMany({
                    where: Object.keys(queries).reduce((aggregate, property) => {
                        if (property == 'id_invoice' || property == 'id_product') {
                            aggregate[property] = parseInt(queries[property] as any);
                        }
                        return aggregate;
                    }, {}),
                    include: {
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
                    id_invoice: res.id_invoice,
                    invoice_number: res.invoice_number,
                    invoice_date: res.invoice_date,
                    id_pelanggan: res.id_pelanggan,
                    id_setting_company: res.pelanggan.setting_company.id_setting_company,
                    company_name: res.pelanggan.setting_company.company_name,
                    full_name: res.pelanggan.full_name,
                    pelanggan_code: res.pelanggan.pelanggan_code,
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
            let res = await this._prismaService
                .invoice
                .create({
                    data: {
                        ...payload,
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
}
