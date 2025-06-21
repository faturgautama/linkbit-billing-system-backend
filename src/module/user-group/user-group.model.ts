import { IsNotEmpty, IsString, IsNumber, IsBoolean } from "class-validator";

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
        @IsNotEmpty()
        @IsString()
        user_group: string;
      }

      export class UpdateUserGroup {
        @IsNotEmpty()
        @IsNumber()
        id_user_group: number;
      
        @IsNotEmpty()
        @IsString()
        user_group: string;
      
        @IsNotEmpty()
        @IsBoolean()
        is_active: boolean;
      }
}