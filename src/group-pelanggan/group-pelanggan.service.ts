import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';
import { GroupPelangganModel } from './group-pelanggan.model';
import { SettingCompanyService } from 'src/setting-company/setting-company.service';

@Injectable({ scope: Scope.TRANSIENT })
export class GroupPelangganService {

    constructor(
        private _prismaService: PrismaService,
        private _settingCompanyService: SettingCompanyService,
    ) { }

    async getAll(req: Request, query: GroupPelangganModel.IGroupPelangganQueryParams): Promise<GroupPelangganModel.GetAllGroupPelanggan> {
        try {
            let queries: any = { ...query }

            const setting_company = await this._settingCompanyService.getById(parseInt(req['user']['id_setting_company']));

            if (setting_company.status) {
                if (!setting_company.data.is_cabang && !setting_company.data.is_mitra) {
                    // ** do nothing
                };

                // ** Queries id_setting_company
                if (setting_company.data.is_cabang || setting_company.data.is_mitra) {
                    queries.id_setting_company = setting_company.data.id_setting_company;
                }
            }

            let res: any[] = await this._prismaService
                .group_pelanggan
                .findMany({
                    where: Object.keys(queries).reduce((aggregate, property) => {
                        if (property == 'id_kelas') {
                            aggregate[property] = parseInt(query[property] as any);
                        }
                        return aggregate;
                    }, {}),
                    orderBy: {
                        id_group_pelanggan: 'asc'
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

    async getById(id_group_pelanggan: number): Promise<GroupPelangganModel.GetByIdGroupPelanggan> {
        try {
            let res: any = await this._prismaService
                .group_pelanggan
                .findUnique({
                    where: { id_group_pelanggan: parseInt(id_group_pelanggan as any) }
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

    async create(req: Request, payload: GroupPelangganModel.CreateGroupPelanggan): Promise<any> {
        try {
            let res = await this._prismaService
                .group_pelanggan
                .create({
                    data: {
                        ...payload,
                        id_setting_company: req['user']['id_setting_company'],
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

    async update(req: Request, payload: GroupPelangganModel.UpdateGroupPelanggan): Promise<any> {
        try {
            const { id_group_pelanggan, ...data } = payload

            let res = await this._prismaService
                .group_pelanggan
                .update({
                    where: { id_group_pelanggan: parseInt(id_group_pelanggan as any) },
                    data: {
                        ...data,
                        id_setting_company: req['user']['id_setting_company'],
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
