import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserModel } from './user.model';
import { Request } from 'express';

@Injectable({ scope: Scope.TRANSIENT })
export class UserService {

    constructor(
        private _prismaService: PrismaService,
    ) { }

    async getAll(query: UserModel.IUserQueryParams): Promise<UserModel.GetAllUser> {
        try {
            let res = await this._prismaService
                .user
                .findMany({
                    where: Object.keys(query).reduce((aggregate, property) => {
                        if (property == 'id_user_group') {
                            aggregate[property] = parseInt(query[property] as any);
                        } else {
                            aggregate[property] = {
                                contains: query[property]
                            }
                        }
                        return aggregate;
                    }, {

                    }),
                    include: {
                        user_group: {
                            select: {
                                id_user_group: true,
                                user_group: true
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
                        }
                    }
                });

            const { user_group, ...data } = res;

            return {
                status: true,
                message: '',
                data: {
                    ...data,
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
