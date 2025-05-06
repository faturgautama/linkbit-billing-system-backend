import { IsEnum, IsOptional } from "class-validator";

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
        id_setting_company?: string;
        id_pelanggan?: string;
        id_product?: string;
        invoice_number?: string;
        invoice_date?: string;

        @IsOptional()
        @IsEnum(InvoiceStatus)
        invoice_status?: InvoiceStatus;
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
        invoice_number?: string;
        invoice_date: Date;
        id_pelanggan: number;
        id_pelanggan_product: number;
        id_product: number;
        price: number;
        diskon_percentage: number;
        diskon_rupiah: number;
        pajak: number;
        admin_fee: number;
        unique_code: string;
        total: number;
        due_date: Date;
        notes?: string;
    }

    export class UpdateInvoice {
        id_invoice: number;
        invoice_number: string;
        invoice_date: Date;
        id_pelanggan: number;
        id_pelanggan_product: number;
        id_product: number;
        price: number;
        diskon_percentage: number;
        diskon_rupiah: number;
        pajak: number;
        admin_fee: number;
        unique_code: string;
        total: number;
        due_date: Date;
        notes?: string;
    }
}