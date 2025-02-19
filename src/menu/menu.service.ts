import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';
import { MenuModel } from './menu.model';

@Injectable({ scope: Scope.TRANSIENT })
export class MenuService {

    constructor(
        private _prismaService: PrismaService,
    ) { }

    async getAll(query: MenuModel.IMenuQueryParams): Promise<MenuModel.GetAllMenu> {
        try {
            let res: any[] = await this._prismaService
                .menu
                .findMany({
                    orderBy: {
                        id_menu: 'asc',
                    }
                });

            const newArr = res.map((item) => {
                return {
                    id_menu: item.id_menu,
                    id_parent: item.id_parent,
                    menu_parent: item.id_parent ? res.find(menus => menus.id_menu == item.id_parent).menu : null,
                    ...item,
                }
            }).sort((a, b) => {
                if (a.id_parent === null && b.id_parent !== null) return -1;
                if (a.id_parent !== null && b.id_parent === null) return 1;
                return a.id_parent - b.id_parent;
            }).filter((item: any) => {
                if (query.id_parent && !query.menu) {
                    return item.id_parent == query.id_parent
                };

                if (!query.id_parent && query.menu) {
                    return item.menu.toLowerCase().includes(query.menu.toLowerCase())
                };

                if (query.id_parent && query.menu) {
                    return item.id_parent == query.id_parent && item.menu.toLowerCase().includes(query.menu.toLowerCase());
                };

                if (!query.id_parent && !query.menu) {
                    return item;
                };
            })

            return {
                status: true,
                message: '',
                data: newArr
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

    async getById(id_menu: number): Promise<MenuModel.GetByIdMenu> {
        try {
            let res: any = await this._prismaService
                .menu
                .findUnique({
                    where: { id_menu: parseInt(id_menu as any) }
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

    async create(req: Request, payload: MenuModel.CreateMenu): Promise<any> {
        try {
            let res = await this._prismaService
                .menu
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

    async update(req: Request, payload: MenuModel.UpdateMenu): Promise<any> {
        try {
            const { id_menu, ...data } = payload

            let res = await this._prismaService
                .menu
                .update({
                    where: { id_menu: parseInt(id_menu as any) },
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
