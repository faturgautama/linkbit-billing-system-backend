import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { PelangganModel } from './pelanggan.model';
import { SettingCompanyService } from 'src/setting-company/setting-company.service';

@Injectable({ scope: Scope.TRANSIENT })
export class PelangganService {

    constructor(
        private _prismaService: PrismaService,
        private _settingCompanyService: SettingCompanyService,
    ) { }

    async getAll(req: Request, query: PelangganModel.IPelangganQueryParams): Promise<PelangganModel.GetAllPelanggan> {
        try {
            let queries: any = { ...query }

            let newQueries: any = Object.keys(queries).reduce((aggregate, property) => {
                if (property == 'id_group_pelanggan' || property == 'id_setting_company') {
                    aggregate[property] = parseInt(query[property] as any);
                }
                return aggregate;
            }, {});

            const setting_company = await this._settingCompanyService.getById(parseInt(req['user']['id_setting_company']));

            if (setting_company.status) {
                if (!setting_company.data.is_cabang && !setting_company.data.is_mitra) {
                    // ** do nothing
                    if (query.id_setting_company) {
                        newQueries.id_setting_company = parseInt(query.id_setting_company);
                    }
                };

                // ** Queries id_setting_company
                if (setting_company.data.is_cabang || setting_company.data.is_mitra) {
                    newQueries.id_setting_company = parseInt(setting_company.data.id_setting_company as any);
                }
            }

            let res: any[] = await this._prismaService
                .pelanggan
                .findMany({
                    where: newQueries,
                    orderBy: {
                        id_pelanggan: 'asc'
                    },
                });

            let pelangganArr = [];

            for (let item of res) {
                const product_pelanggan = await this._prismaService
                    .pelanggan_product
                    .findFirst({
                        where: {
                            id_pelanggan: item.id_pelanggan
                        },
                        include: {
                            product: {
                                select: {
                                    id_product: true,
                                    product_name: true
                                }
                            }
                        }
                    });

                item.id_pelanggan_product = product_pelanggan ? product_pelanggan.id_pelanggan_product : null;
                item.product_id = product_pelanggan ? product_pelanggan.product.id_product : null;
                item.product_name = product_pelanggan ? product_pelanggan.product.product_name : null;
                item.product_start_date = product_pelanggan ? product_pelanggan.start_date : null;
                item.product_price = product_pelanggan ? product_pelanggan.price : null;
                item.product_days_before_send_invoice = product_pelanggan ? product_pelanggan.days_before_send_invoice : null;
                item.product_invoice_cycle = product_pelanggan ? product_pelanggan.invoice_cycle : null;

                pelangganArr.push(item);
            }

            return {
                status: true,
                message: '',
                data: pelangganArr
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

    async getById(id_pelanggan: number): Promise<PelangganModel.GetByIdPelanggan> {
        try {
            let res: any = await this._prismaService
                .pelanggan
                .findUnique({
                    where: { id_pelanggan: parseInt(id_pelanggan as any) }
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

    async create(req: Request, payload: PelangganModel.CreatePelanggan): Promise<any> {
        try {
            let res = await this._prismaService
                .pelanggan
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
            console.log("error =>", error);

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

    async update(req: Request, payload: PelangganModel.UpdatePelanggan): Promise<any> {
        try {
            const { id_pelanggan, ...data } = payload;

            const setting_company = await this._prismaService
                .setting_company
                .findFirst();

            let res = await this._prismaService
                .pelanggan
                .update({
                    where: { id_pelanggan: parseInt(id_pelanggan as any) },
                    data: {
                        ...data,
                        id_setting_company: parseInt(setting_company.id_setting_company as any),
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

    async updateProductPelanggan(req: Request, payload: PelangganModel.UpdateProductPelanggan): Promise<any> {
        try {
            let res = null;

            let pelanggan_product = await this._prismaService
                .pelanggan_product
                .findFirst({
                    where: {
                        id_pelanggan: parseInt(payload.id_pelanggan as any),
                    }
                });

            if (pelanggan_product) {
                res = await this._prismaService
                    .pelanggan_product
                    .update({
                        where: {
                            id_pelanggan_product: parseInt(pelanggan_product.id_pelanggan_product as any)
                        },
                        data: {
                            id_product: parseInt(payload.id_product as any),
                            invoice_cycle: payload.invoice_cycle,
                            price: payload.price,
                            days_before_send_invoice: payload.days_before_send_invoice,
                            start_date: new Date(payload.start_date),
                            update_at: new Date(),
                            update_by: parseInt(req['user']['id_user'] as any)
                        }
                    });
            } else {
                res = await this._prismaService
                    .pelanggan_product
                    .create({
                        data: {
                            id_pelanggan: parseInt(payload.id_pelanggan as any),
                            id_product: parseInt(payload.id_product as any),
                            start_date: new Date(payload.start_date),
                            invoice_cycle: payload.invoice_cycle,
                            price: payload.price,
                            days_before_send_invoice: payload.days_before_send_invoice,
                            create_at: new Date(),
                            create_by: parseInt(req['user']['id_user'] as any)
                        }
                    });
            }

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            console.log("error create / update pelanggan product =>", error);
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

    async updateManyProductPelanggan(req: Request, payload: PelangganModel.UpdateManyProductPelanggan): Promise<any> {
        try {
            let res = 0;

            for (const item of payload.pelanggan) {
                let pelanggan_product = await this._prismaService
                    .pelanggan_product
                    .findFirst({
                        where: {
                            id_pelanggan: parseInt(item as any),
                        },
                        select: {
                            id_pelanggan_product: true
                        }
                    });


                if (pelanggan_product) {
                    const update = await this._prismaService
                        .pelanggan_product
                        .update({
                            where: {
                                id_pelanggan_product: parseInt(pelanggan_product.id_pelanggan_product as any)
                            },
                            data: {
                                id_product: payload.id_product,
                                invoice_cycle: payload.invoice_cycle,
                                price: payload.price,
                                days_before_send_invoice: payload.days_before_send_invoice,
                                start_date: new Date(payload.start_date),
                                update_at: new Date(),
                                update_by: parseInt(req['user']['id_user'] as any)
                            }
                        });

                    if (update.id_pelanggan_product) {
                        res += 1;
                    }

                } else {
                    const create = await this._prismaService
                        .pelanggan_product
                        .create({
                            data: {
                                id_pelanggan: parseInt(item as any),
                                id_product: payload.id_product,
                                price: payload.price,
                                days_before_send_invoice: payload.days_before_send_invoice,
                                start_date: new Date(payload.start_date),
                                invoice_cycle: payload.invoice_cycle,
                                create_at: new Date(),
                                create_by: parseInt(req['user']['id_user'] as any)
                            }
                        });

                    if (create.id_pelanggan_product) {
                        res += 1;
                    }
                }
            }

            return {
                status: res == payload.pelanggan.length ? true : false,
                message: 'Produk Layanan Pelanggan Berhasil Disimpan',
                data: null
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
