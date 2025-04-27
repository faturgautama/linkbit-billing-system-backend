import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserModel } from './user.model';
import { Request } from 'express';
import { SettingCompanyService } from 'src/setting-company/setting-company.service';

@Injectable({ scope: Scope.TRANSIENT })
export class UserService {

    constructor(
        private _prismaService: PrismaService,
        private _settingCompanyService: SettingCompanyService,
    ) { }

    async getAll(req: Request, query: UserModel.IUserQueryParams): Promise<UserModel.GetAllUser> {
        try {
            let queries: any = { ...query }

            queries.id_setting_company = parseInt(req['user']['id_setting_company']);

            let res = await this._prismaService
                .user
                .findMany({
                    where: Object.keys(queries).reduce((aggregate, property) => {
                        if (property == 'id_user_group' || property == 'id_setting_company') {
                            aggregate[property] = parseInt(queries[property] as any);
                        } else {
                            aggregate[property] = {
                                contains: queries[property]
                            }
                        }
                        return aggregate;
                    }, {}),
                    include: {
                        user_group: {
                            select: {
                                id_user_group: true,
                                user_group: true
                            }
                        },
                        setting_company: {
                            select: {
                                company_name: true
                            }
                        }
                    },
                    orderBy: {
                        id_user: 'asc'
                    }
                });

            return {
                status: true,
                message: '',
                data: res.map((item) => {
                    return {
                        id_user: item.id_user,
                        id_setting_company: item.id_setting_company,
                        company_name: item.setting_company.company_name,
                        id_user_group: item.user_group.id_user_group,
                        user_group: item.user_group.user_group,
                        username: item.username,
                        full_name: item.full_name,
                        email: item.email,
                        address: item.address,
                        phone: item.phone,
                        whatsapp: item.whatsapp,
                        notes: item.notes,
                        is_active: item.is_active,
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

    async getById(id_user: number): Promise<UserModel.GetByIdUser> {
        try {
            let res = await this._prismaService
                .user
                .findUnique({
                    where: { id_user: parseInt(id_user as any) },
                    include: {
                        user_group: {
                            select: {
                                id_user_group: true,
                                user_group: true
                            }
                        },
                        setting_company: {
                            select: {
                                company_name: true
                            }
                        }
                    }
                });

            const { user_group, ...data } = res;

            return {
                status: true,
                message: '',
                data: {
                    ...data,
                    id_setting_company: data.id_setting_company,
                    company_name: data.setting_company.company_name,
                    id_user_group: user_group.id_user_group,
                    user_group: user_group.user_group,
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

    async update(req: Request, payload: UserModel.UpdateUser): Promise<any> {
        try {
            const { id_user, ...data } = payload

            let res = await this._prismaService
                .user
                .update({
                    where: { id_user: parseInt(id_user as any) },
                    data: {
                        id_setting_company: data.id_setting_company,
                        id_user_group: data.id_user_group,
                        username: data.username,
                        full_name: data.full_name,
                        email: data.email,
                        address: data.address,
                        phone: data.phone,
                        whatsapp: data.whatsapp,
                        notes: data.notes,
                        is_active: data.is_active,
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
