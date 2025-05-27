import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SettingCompanyModel } from './setting-company.model';
import { Request } from 'express';

@Injectable({ scope: Scope.TRANSIENT })
export class SettingCompanyService {

    constructor(
        private _prismaService: PrismaService,
    ) { }

    async getAll(query: SettingCompanyModel.ISettingCompanyQuery): Promise<SettingCompanyModel.GetAllSettingCompany> {
        try {
            let res: any[] = await this._prismaService
                .setting_company
                .findMany({
                    where: Object.keys(query).reduce((aggregate, property) => {
                        if (property === 'company_name') {
                            aggregate[property] = { contains: query[property] };
                        } else {
                            // For boolean values, check if the value is a string and convert it
                            if (query[property] === 'true') {
                                aggregate[property] = true;
                            } else if (query[property] === 'false') {
                                aggregate[property] = false;
                            } else {
                                aggregate[property] = query[property];
                            }
                        }
                        return aggregate;
                    }, {}),
                    orderBy: {
                        id_setting_company: 'asc'
                    }
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

    async getById(id_setting_company: number): Promise<SettingCompanyModel.GetByIdSettingCompany> {
        try {
            let res: any = await this._prismaService
                .setting_company
                .findUnique({
                    where: {
                        id_setting_company: parseInt(id_setting_company as any)
                    },
                    include: {
                        payment_method_manual: true
                    }
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

    async create(req: Request, payload: SettingCompanyModel.CreateSettingCompany): Promise<any> {
        try {
            let res = await this._prismaService
                .setting_company
                .create({
                    data: {
                        ...payload,
                        create_at: new Date(),
                        create_by: parseInt(req['user']['id_user'] as any),
                        is_active: true,

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

    async update(req: Request, payload: SettingCompanyModel.UpdateSettingCompany): Promise<any> {
        try {
            const { id_setting_company, ...data } = payload

            let res = await this._prismaService
                .setting_company
                .update({
                    where: { id_setting_company: parseInt(id_setting_company as any) },
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

    async getAllPaymentMethodManual(id_setting_company: number): Promise<SettingCompanyModel.GetAllPaymentMethodManual> {
        try {
            let res: any[] = await this._prismaService
                .payment_method_manual
                .findMany({
                    where: {
                        id_setting_company: parseInt(id_setting_company as any),
                        is_active: true
                    }
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

    async createPaymentMethodManual(req: Request, payload: SettingCompanyModel.CreatePaymentMethodManual): Promise<any> {
        try {
            let res = await this._prismaService
                .payment_method_manual
                .create({
                    data: {
                        id_setting_company: parseInt(req['user']['id_setting_company'] as any),
                        payment_method: payload.payment_method,
                        no_rekening: payload.no_rekening,
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

    async updatePaymentMethodManual(req: Request, payload: SettingCompanyModel.UpdatePaymentMethodManual): Promise<any> {
        try {
            let res = await this._prismaService
                .payment_method_manual
                .update({
                    where: {
                        id_payment_method_manual: parseInt(payload.id_payment_method_manual as any)
                    },
                    data: {
                        payment_method: payload.payment_method,
                        no_rekening: payload.no_rekening,
                        is_active: payload.is_active,
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

    async getAllChannelWhatsapp(id_setting_company: number): Promise<SettingCompanyModel.GetAllSettingChannelWhatsapp> {
        try {
            let res: any[] = await this._prismaService
                .setting_channel_whatsapp
                .findMany({
                    where: {
                        id_setting_company: parseInt(id_setting_company as any),
                        is_active: true
                    }
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

    async createChannelWhatsapp(req: Request, payload: SettingCompanyModel.CreateSettingChannelWhatsapp): Promise<any> {
        try {
            let res = await this._prismaService
                .setting_channel_whatsapp
                .create({
                    data: {
                        id_setting_company: parseInt(req['user']['id_setting_company'] as any),
                        id_channel_whatsapp: parseInt(payload.id_channel_whatsapp as any),
                        credential: payload.credential,
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

    async updateChannelWhatsapp(req: Request, payload: SettingCompanyModel.UpdateSettingChannelWhatsapp): Promise<any> {
        try {
            let res = await this._prismaService
                .setting_channel_whatsapp
                .update({
                    where: {
                        id_setting_channel_whatsapp: parseInt(payload.id_setting_channel_whatsapp as any)
                    },
                    data: {
                        id_channel_whatsapp: parseInt(payload.id_channel_whatsapp as any),
                        credential: payload.credential,
                        is_default: payload.is_default,
                        is_active: payload.is_active,
                        update_at: new Date(),
                        update_by: parseInt(req['user']['id_user'] as any)
                    }
                });

            if (res.is_default) {
                const othersChannelWhatsapp = await this._prismaService
                    .setting_channel_whatsapp
                    .updateMany({
                        where: {
                            is_default: true,
                            id_setting_channel_whatsapp: {
                                not: parseInt(res.id_setting_channel_whatsapp as any)
                            }
                        },
                        data: {
                            is_default: false,
                            update_at: new Date(),
                            update_by: parseInt(req['user']['id_user'] as any)
                        }
                    });
            }

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
