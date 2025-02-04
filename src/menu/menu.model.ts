export namespace MenuModel {
    export class IMenu {
        id_menu: number;
        id_parent: number | null;
        menu: string;
        icon: string;
        url: string;
        is_active: string;
        create_at: Date;
        create_by: number;
        update_at: Date;
        update_by: number;
    }

    export class IMenuQueryParams {
        id_parent?: number;
        menu?: string;
    }

    export class GetAllMenu {
        status: boolean;
        message: string;
        data: IMenu[]
    }

    export class GetByIdMenu {
        status: boolean;
        message: string;
        data: IMenu;
    }

    export class CreateMenu {
        id_parent: number | null;
        menu: string;
        icon: string;
        url: string;
    }

    export class UpdateMenu {
        id_menu: number;
        id_parent: number | null;
        menu: string;
        icon: string;
        url: string;
        is_active: boolean;
    }
}