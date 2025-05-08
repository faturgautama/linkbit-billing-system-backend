export namespace UserGroupMenuModel {
    export class IUserGroupMenu {
        id_user_group_menu: number;
        id_user_group: number;
        user_group: string;
        id_menu: number;
        id_menu_parent: number | null;
        menu: string;
        icon: string;
        url: string;
        is_assigned: boolean;
        child: IUserGroupMenu[];
    }

    export class IUserGroupMenuQueryParams {
        id_user_group?: string;
        menu?: string;
    }

    export class GetAllUserGroupMenu {
        status: boolean;
        message: string;
        data: IUserGroupMenu[]
    }

    export class CreateUserGroupMenu {
        id_user_group: number;
        id_menu: number;
    }
}