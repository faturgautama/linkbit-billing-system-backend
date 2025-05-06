export namespace UserGroupModel {
    export class IUserGroup {
        id_user_group: number;
        user_group: string;
        is_active: boolean;
        create_at: Date;
        create_by: number;
        update_at: Date;
        update_by: number;
    }

    export class IUserGroupQueryParams {
        user_group?: string;
    }

    export class GetAllUserGroup {
        status: boolean;
        message: string;
        data: IUserGroup[]
    }

    export class GetByIdUserGroup {
        status: boolean;
        message: string;
        data: IUserGroup;
    }

    export class CreateUserGroup {
        user_group: string;
    }

    export class UpdateUserGroup {
        id_user_group: number;
        user_group: string;
        is_active: boolean;
    }
}