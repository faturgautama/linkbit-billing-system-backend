export namespace InvoiceModel {
    export class IInvoice {
        id_invoice: number;
        invoice_number: string;
        invoice_date: Date;
        id_pelanggan: number;
        full_name: string;
        pelanggan_code: string;
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
        create_at: Date;
        create_by: number;
        update_at: Date;
        update_by: number;
        is_deleted: boolean;
        delete_at: Date;
        delete_by: number;
    }

    export class IInvoiceQueryParams {
        id_pelanggan?: string;
        id_product?: string;
        invoice_number?: string;
        invoice_date?: string;
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