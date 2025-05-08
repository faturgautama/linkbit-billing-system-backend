export namespace GroupPelangganModel {
    export class IGroupPelanggan {
        id_group_pelanggan: number;
        group_pelanggan: string;
        is_active: boolean;
        create_at: Date;
        create_by: number;
        update_at: Date;
        update_by: number;
    }

    export class IGroupPelangganQueryParams {
        group_pelanggan?: string;
    }

    export class GetAllGroupPelanggan {
        status: boolean;
        message: string;
        data: IGroupPelanggan[]
    }

    export class GetByIdGroupPelanggan {
        status: boolean;
        message: string;
        data: IGroupPelanggan;
    }

    export class CreateGroupPelanggan {
        group_pelanggan: string;
    }

    export class UpdateGroupPelanggan {
        id_group_pelanggan: number;
        group_pelanggan: string;
        is_active: boolean;
    }
}