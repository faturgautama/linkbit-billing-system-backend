import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserGroupMenuModel } from './user-group-menu.model';

@Injectable({ scope: Scope.TRANSIENT })
export class UserGroupMenuService {

    constructor(
        private _prismaService: PrismaService,
    ) { }

    async getAll(query: UserGroupMenuModel.IUserGroupMenuQueryParams): Promise<UserGroupMenuModel.GetAllUserGroupMenu> {
        try {
            let res = await this._prismaService
                .user_group_menu
                .findMany({
                    where: Object.keys(query).reduce((aggregate, property) => {
                        if (property == 'id_user_group') {
                            aggregate[property] = parseInt(query[property] as any);
                        }
                        return aggregate;
                    }, {}),
                    include: {
                        user_group: {
                            select: {
                                user_group: true,
                            }
                        },
                        menu: {
                            select: {
                                id_parent: true,
                                menu: true,
                                icon: true,
                                url: true,
                            }
                        }
                    },
                    orderBy: {
                        id_user_group_menu: 'asc'
                    }
                });

            const userGroupMenuArr = res.map((item) => {
                return {
                    id_user_group_menu: item.id_user_group_menu,
                    id_user_group: item.id_user_group,
                    user_group: item.user_group.user_group,
                    id_menu: item.id_menu,
                    id_menu_parent: item.menu.id_parent,
                    menu: item.menu.menu,
                    icon: item.menu.icon,
                    url: item.menu.url,
                    is_assigned: true,
                    child: []
                }
            });

            const menuArr = await this._prismaService
                .menu
                .findMany({
                    where: {
                        is_active: true
                    }
                });

            // 1. Tandai apakah menu sudah terhubung dengan user group
            const menusWithAssignedStatus = menuArr.map(menu => {
                const userGroupMenu = userGroupMenuArr.find(ugm => ugm.id_menu === menu.id_menu);

                return {
                    id_user_group_menu: userGroupMenu ? userGroupMenu.id_user_group_menu : null,
                    ...menu,
                    is_assigned: !!userGroupMenu,
                    child: []
                };
            });

            // 2. Buat struktur hierarki berdasarkan id_parent
            const menuMap = new Map(menusWithAssignedStatus.map(menu => [menu.id_menu, menu]));

            // 3. Hubungkan parent dan child
            const rootMenus = [];

            menusWithAssignedStatus.forEach(menu => {
                if (menu.id_parent === null) {
                    rootMenus.push(menu);
                } else {
                    const parentMenu = menuMap.get(menu.id_parent);
                    if (parentMenu) {
                        parentMenu.child.push(menu);
                    }
                }
            });

            return {
                status: true,
                message: '',
                data: rootMenus
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

    async getOnlyAssigned(id_user_group: number): Promise<UserGroupMenuModel.GetAllUserGroupMenu> {
        try {
            let res = await this._prismaService
                .user_group_menu
                .findMany({
                    where: {
                        id_user_group: parseInt(id_user_group as any)
                    },
                    include: {
                        user_group: { select: { user_group: true } },
                        menu: { select: { id_parent: true, menu: true, icon: true, url: true } }
                    },
                    orderBy: { id_user_group_menu: 'asc' }
                });

            const userGroupMenuArr = res.map(item => ({
                id_user_group_menu: item.id_user_group_menu,
                id_user_group: item.id_user_group,
                user_group: item.user_group.user_group,
                id_menu: item.id_menu,
                id_menu_parent: item.menu.id_parent,
                menu: item.menu.menu,
                icon: item.menu.icon,
                url: item.menu.url,
                is_assigned: true,
                child: []
            }));

            const menuArr = await this._prismaService.menu.findMany({ where: { is_active: true } });

            // 1. Tandai apakah menu sudah terhubung dengan user group
            const menusWithAssignedStatus = menuArr.map(menu => {
                const userGroupMenu = userGroupMenuArr.find(ugm => ugm.id_menu === menu.id_menu);

                return {
                    id_user_group_menu: userGroupMenu ? userGroupMenu.id_user_group_menu : null,
                    ...menu,
                    is_assigned: !!userGroupMenu,
                    child: []
                };
            });

            // 2. Buat struktur hierarki berdasarkan id_parent
            const menuMap = new Map(menusWithAssignedStatus.map(menu => [menu.id_menu, menu]));

            // 3. Hubungkan parent dan child
            menusWithAssignedStatus.forEach(menu => {
                if (menu.id_parent !== null) {
                    const parentMenu = menuMap.get(menu.id_parent);
                    if (parentMenu) {
                        parentMenu.child.push(menu);
                    }
                }
            });

            // 4. Filter hanya yang `is_assigned = true`
            function filterAssignedMenus(menus: any[]): any[] {
                return menus
                    .filter(menu => menu.is_assigned)
                    .map(menu => ({
                        ...menu,
                        child: filterAssignedMenus(menu.child) // Rekursi untuk child
                    }));
            }

            const rootMenus = filterAssignedMenus(menusWithAssignedStatus.filter(menu => menu.id_parent === null));

            return {
                status: true,
                message: '',
                data: rootMenus
            };

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

    async create(payload: UserGroupMenuModel.CreateUserGroupMenu): Promise<any> {
        try {
            let res = await this._prismaService
                .user_group_menu
                .create({
                    data: payload
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

    async delete(id_user_group_menu: number): Promise<any> {
        try {
            let res = await this._prismaService
                .user_group_menu
                .delete({
                    where: { id_user_group_menu: parseInt(id_user_group_menu as any) },
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
