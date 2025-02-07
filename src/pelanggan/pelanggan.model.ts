export namespace PelangganModel {
    export class IPelanggan {
        id_pelanggan: number;
        id_setting_company: number;
        id_group_pelanggan: number;
        group_pelanggan: string;
        full_name: string;
        pelanggan_code: string;
        identity_number: string;
        email: string;
        password: string;
        alamat: string;
        phone: string;
        whatsapp: string;
        subscribe_start_date: Date;
        pic_name: string;
        notes: string;
        is_active: boolean;
        create_at: Date;
        create_by: number;
        update_at: Date;
        update_by: number;
    }

    export class IPelangganQueryParams {
        id_group_pelanggan?: number;
        full_name?: string;
        pelanggan_code?: string;
        phone?: string;
    }

    export class GetAllPelanggan {
        status: boolean;
        message: string;
        data: IPelanggan[]
    }

    export class GetByIdPelanggan {
        status: boolean;
        message: string;
        data: IPelanggan;
    }

    export class CreatePelanggan {
        id_group_pelanggan: number;
        full_name: string;
        pelanggan_code: string;
        identity_number: string;
        email: string;
        password: string;
        alamat: string;
        phone: string;
        whatsapp: string;
        subscribe_start_date: Date;
        pic_name: string;
        notes: string;
    }

    export class UpdatePelanggan {
        id_pelanggan: number;
        id_group_pelanggan: number;
        full_name: string;
        pelanggan_code: string;
        identity_number: string;
        email: string;
        password: string;
        alamat: string;
        phone: string;
        whatsapp: string;
        subscribe_start_date: Date;
        pic_name: string;
        notes: string;
    }
}