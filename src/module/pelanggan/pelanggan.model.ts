import { ArrayNotEmpty, IsArray, IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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
        search?: string;
        is_active?: boolean;
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
        @IsNotEmpty()
        @IsNumber()
        id_group_pelanggan: number;

        @IsNotEmpty()
        @IsNumber()
        id_setting_company: number;

        @IsNotEmpty()
        @IsString()
        full_name: string;

        @IsNotEmpty()
        @IsString()
        pelanggan_code: string;

        @IsOptional()
        @IsString()
        identity_number: string;

        @IsOptional()
        @IsEmail()
        email: string;

        @IsOptional()
        @IsString()
        password: string;

        @IsOptional()
        @IsString()
        alamat: string;

        @IsOptional()
        @IsString()
        phone: string;

        @IsOptional()
        @IsString()
        whatsapp: string;

        @IsOptional()
        @IsDateString()
        subscribe_start_date: Date;

        @IsOptional()
        @IsString()
        pic_name: string;

        @IsOptional()
        @IsString()
        notes: string;
    }

    export class UpdatePelanggan {
        @IsNotEmpty()
        @IsNumber()
        id_pelanggan: number;

        @IsNotEmpty()
        @IsNumber()
        id_setting_company: number;

        @IsNotEmpty()
        @IsNumber()
        id_group_pelanggan: number;

        @IsNotEmpty()
        @IsString()
        full_name: string;

        @IsNotEmpty()
        @IsString()
        pelanggan_code: string;

        @IsOptional()
        @IsString()
        identity_number: string;

        @IsOptional()
        @IsEmail()
        email: string;

        @IsOptional()
        @IsString()
        password: string;

        @IsOptional()
        @IsString()
        alamat: string;

        @IsOptional()
        @IsString()
        phone: string;

        @IsOptional()
        @IsString()
        whatsapp: string;

        @IsOptional()
        @IsDateString()
        subscribe_start_date: Date;

        @IsOptional()
        @IsString()
        pic_name: string;

        @IsOptional()
        @IsString()
        notes: string;

        @IsNotEmpty()
        @IsBoolean()
        is_active: boolean;
    }

    export class UpdateProductPelanggan {
        @IsNotEmpty()
        @IsNumber()
        id_pelanggan: number;

        @IsNotEmpty()
        @IsNumber()
        id_product: number;

        @IsNotEmpty()
        @IsDateString()
        start_date: Date;

        @IsNotEmpty()
        @IsNumber()
        price: number;

        @IsNotEmpty()
        @IsString()
        invoice_cycle: string;

        @IsNotEmpty()
        @IsNumber()
        days_before_send_invoice: number;
    }

    export class UpdateManyProductPelanggan {
        @IsNotEmpty()
        @IsNumber()
        id_product: number;

        @IsNotEmpty()
        @IsDateString()
        start_date: Date;

        @IsNotEmpty()
        @IsNumber()
        price: number;

        @IsNotEmpty()
        @IsString()
        invoice_cycle: string;

        @IsNotEmpty()
        @IsNumber()
        days_before_send_invoice: number;

        @IsArray()
        @ArrayNotEmpty()
        @IsNumber({}, { each: true })
        pelanggan: number[];
    }

}

