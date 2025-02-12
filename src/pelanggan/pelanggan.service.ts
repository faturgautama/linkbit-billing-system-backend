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

            const setting_company = await this._settingCompanyService.getById(parseInt(req['user']['id_setting_company']));

            if (setting_company.status) {
                if (!setting_company.data.is_cabang && !setting_company.data.is_mitra) {
                    // ** do nothing
                    if (query.id_setting_company) {
                        queries.id_setting_company = parseInt(query.id_setting_company);
                    }
                };

                // ** Queries id_setting_company
                if (setting_company.data.is_cabang || setting_company.data.is_mitra) {
                    queries.id_setting_company = parseInt(setting_company.data.id_setting_company as any);
                }
            }

            let res: any[] = await this._prismaService
                .pelanggan
                .findMany({
                    where: Object.keys(query).reduce((aggregate, property) => {
                        if (property == 'id_group_pelanggan') {
                            aggregate[property] = parseInt(query[property] as any);
                        }
                        return aggregate;
                    }, {}),
                    orderBy: {
                        id_pelanggan: 'asc'
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
}
