import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export namespace InvoiceModel {
    export class IInvoice {
        id_invoice: number;
        invoice_number: string;
        invoice_date: Date;
        id_pelanggan: number;
        id_setting_company: number;
        company_name: string;
        full_name: string;
        pelanggan_code: string;
        whatsapp: string;
        id_pelanggan_product: number;
        id_product: number;
        product_name: string;
        price: number;
        diskon_percentage: number;
        diskon_rupiah: number;
        pajak: number;
        admin_fee: number;
        unique_code: string;
        total: number;
        due_date: Date;
        notes?: string;
        invoice_status: string;
        id_payment: number;
        payment_date: Date;
        payment_status: string;
        payment_method: string;
        payment_amount: number;
        create_at: Date;
        create_by: number;
        update_at: Date;
        update_by: number;
        is_deleted: boolean;
        delete_at: Date;
        delete_by: number;
    }

    export enum InvoiceStatus {
        PENDING = 'PENDING',
        EXPIRED = 'EXPIRED',
        CANCEL = 'CANCEL',
        PAID = 'PAID',
    }

    export class IInvoiceQueryParams {
        invoice_number?: string;
        invoice_date?: string;
        full_name?: string;
        pelanggan_code?: string;
        id_product?: string;
        invoice_status?: string;
        search?: string;
    }

    export class GetAllInvoice {
        status: boolean;
        message: string;
        data: IInvoice[]
    }

    export class GetByIdInvoice {
        status: boolean;
        message: string;
        data: IInvoice;
    }

    export class CreateInvoice {
        @IsOptional()
        @IsString()
        invoice_number?: string;

        @IsNotEmpty()
        @IsDateString()
        invoice_date: Date;

        @IsNotEmpty()
        @IsNumber()
        id_pelanggan: number;

        @IsNotEmpty()
        @IsNumber()
        id_pelanggan_product: number;

        @IsNotEmpty()
        @IsNumber()
        id_product: number;

        @IsNotEmpty()
        @IsNumber()
        price: number;

        @IsNotEmpty()
        @IsNumber()
        diskon_percentage: number;

        @IsNotEmpty()
        @IsNumber()
        diskon_rupiah: number;

        @IsNotEmpty()
        @IsNumber()
        pajak: number;

        @IsNotEmpty()
        @IsNumber()
        admin_fee: number;

        @IsNotEmpty()
        @IsString()
        unique_code: string;

        @IsNotEmpty()
        @IsNumber()
        total: number;

        @IsNotEmpty()
        @IsDateString()
        due_date: Date;

        @IsOptional()
        @IsString()
        notes?: string;
    }

    export class UpdateInvoice {
        @IsNotEmpty()
        @IsNumber()
        id_invoice: number;

        @IsNotEmpty()
        @IsString()
        invoice_number: string;

        @IsNotEmpty()
        @IsDateString()
        invoice_date: Date;

        @IsNotEmpty()
        @IsNumber()
        id_pelanggan: number;

        @IsNotEmpty()
        @IsNumber()
        id_pelanggan_product: number;

        @IsNotEmpty()
        @IsNumber()
        id_product: number;

        @IsNotEmpty()
        @IsNumber()
        price: number;

        @IsNotEmpty()
        @IsNumber()
        diskon_percentage: number;

        @IsNotEmpty()
        @IsNumber()
        diskon_rupiah: number;

        @IsNotEmpty()
        @IsNumber()
        pajak: number;

        @IsNotEmpty()
        @IsNumber()
        admin_fee: number;

        @IsNotEmpty()
        @IsString()
        unique_code: string;

        @IsNotEmpty()
        @IsNumber()
        total: number;

        @IsNotEmpty()
        @IsDateString()
        due_date: Date;

        @IsOptional()
        @IsString()
        notes?: string;
    }

    export class SendMessageBatch {
        data: IInvoiceBatch[]
    };

    export class IInvoiceBatch {
        id_invoice: number;
    }
}