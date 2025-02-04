export namespace UserModel {
    export class IUser {
        id_user: number;
        id_user_group: number;
        user_group: string;
        username: string;
        full_name: string;
        email: string;
        address: string;
        phone: string;
        whatsapp: string;
        notes: string;
        is_active: boolean;
        create_at: Date;
        create_by: number;
        update_at?: Date;
        update_by?: number;
    }

    export class IUserQueryParams {
        id_user_group?: number;
        username?: string;
        full_name?: string;
        email?: string;
    }

    export class GetAllUser {
        status: boolean;
        message: string;
        data: IUser[]
    }

    export class GetByIdUser {
        status: boolean;
        message: string;
        data: IUser;
    }

    export class UpdateUser {
        id_user: number;
        id_user_group: number;
        username: string;
        full_name: string;
        email: string;
        address: string;
        phone: string;
        whatsapp: string;
        notes: string;
        is_active: boolean;
    }
}