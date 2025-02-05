import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';
import { GroupPelangganModel } from './group-pelanggan.model';

@Injectable({ scope: Scope.TRANSIENT })
export class GroupPelangganService {

    constructor(
        private _prismaService: PrismaService,
    ) { }

    async getAll(query: GroupPelangganModel.IGroupPelangganQueryParams): Promise<GroupPelangganModel.GetAllGroupPelanggan> {
        try {
            let res: any[] = await this._prismaService
                .group_pelanggan
                .findMany({
                    where: Object.keys(query).reduce((aggregate, property) => {
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
