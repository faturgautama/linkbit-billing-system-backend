import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SettingCompanyModel } from './setting-company.model';
import { Request } from 'express';

@Injectable({ scope: Scope.TRANSIENT })
export class SettingCompanyService {

    constructor(
        private _prismaService: PrismaService,
    ) { }

    // async getAll(query: SettingCompanyModel.ISettingCompanyQueryParams): Promise<SettingCompanyModel.GetAllSettingCompany> {
    //     try {
    //         let res: any[] = await this._prismaService
    //             .setting_company
    //             .findMany({
    //                 where: Object.keys(query).reduce((aggregate, property) => {
    //                     if (property == 'id_kelas') {
    //                         aggregate[property] = parseInt(query[property] as any);
    //                     }
    //                     return aggregate;
    //                 }, {}),
    //                 orderBy: {
    //                     id_setting_company: 'asc'
    //                 }
    //             });

    //         return {
    //             status: true,
    //             message: '',
    //             data: res
    //         }

    //     } catch (error) {
    //         const status = error.message.includes('not found')
    //             ? HttpStatus.NOT_FOUND
    //             : error.message.includes('bad request')
    //                 ? HttpStatus.BAD_REQUEST
    //                 : HttpStatus.INTERNAL_SERVER_ERROR;

    //         throw new HttpException(
    //             {
    //                 status: false,
    //                 message: error.message
    //             },
    //             status
    //         );
    //     }
    // }

    async getById(): Promise<SettingCompanyModel.GetByIdSettingCompany> {
        try {
            let res: any = await this._prismaService
                .setting_company
                .findFirst();

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

    // async create(req: Request, payload: SettingCompanyModel.CreateSettingCompany): Promise<any> {
    //     try {
    //         let res = await this._prismaService
    //             .setting_company
    //             .create({
    //                 data: {
    //                     ...payload,
    //                     create_at: new Date(),
    //                     create_by: parseInt(req['user']['id_user'] as any)
    //                 }
    //             })

    //         return {
    //             status: true,
    //             message: '',
    //             data: res
    //         }

    //     } catch (error) {
    //         const status = error.message.includes('not found')
    //             ? HttpStatus.NOT_FOUND
    //             : error.message.includes('bad request')
    //                 ? HttpStatus.BAD_REQUEST
    //                 : HttpStatus.INTERNAL_SERVER_ERROR;

    //         throw new HttpException(
    //             {
    //                 status: false,
    //                 message: error.message
    //             },
    //             status
    //         );
    //     }
    // }

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
}
