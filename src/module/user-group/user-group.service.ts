import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserGroupModel } from './user-group.model';
import { Request } from 'express';

@Injectable({ scope: Scope.TRANSIENT })
export class UserGroupService {

    constructor(
        private _prismaService: PrismaService,
    ) { }

    async getAll(query: UserGroupModel.IUserGroupQueryParams): Promise<UserGroupModel.GetAllUserGroup> {
        try {
            let res: any[] = await this._prismaService
                .user_group
                .findMany({
                    where: Object.keys(query).reduce((aggregate, property) => {
                        if (property == 'id_kelas') {
                            aggregate[property] = parseInt(query[property] as any);
                        }
                        return aggregate;
                    }, {}),
                    orderBy: {
                        id_user_group: 'asc'
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

    async getById(id_user_group: number): Promise<UserGroupModel.GetByIdUserGroup> {
        try {
            let res: any = await this._prismaService
                .user_group
                .findUnique({
                    where: { id_user_group: parseInt(id_user_group as any) }
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

    async create(req: Request, payload: UserGroupModel.CreateUserGroup): Promise<any> {
        try {
            let res = await this._prismaService
                .user_group
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

    async update(req: Request, payload: UserGroupModel.UpdateUserGroup): Promise<any> {
        try {
            const { id_user_group, ...data } = payload

            let res = await this._prismaService
                .user_group
                .update({
                    where: { id_user_group: parseInt(id_user_group as any) },
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
