export namespace LaporanModel {
    export class IQueryParamLaporanTagihan {
        date: string;
        id_setting_company?: number;
        id_product?: number;
        invoice_status?: string;
    }

    export class IRekapTagihanBulanan {
        date: string;
        company_name: string;
        total: number;
        invoice_status: string;
    }

    export class GetRekapTagihanBulanan {
        status: boolean;
        message: string;
        data: IRekapTagihanBulanan[]
    }

    export class IDetailTagihanBulanan {
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
        create_at: Date;
        create_by: number;
        update_at: Date;
        update_by: number;
        is_deleted: boolean;
        delete_at: Date;
        delete_by: number;
    }

    export class GetDetailTagihanBulanan {
        status: boolean;
        message: string;
        data: IDetailTagihanBulanan[]
    }

    export class IQueryParamLaporanPembayaran {
        date: string;
        id_setting_company?: number;
        id_group_pelanggan?: number;
        payment_status?: string;
    }

    export class IRekapPembayaranBulanan {
        date: string;
        company_name: string;
        total: number;
        payment_status: string;
    }

    export class GetRekapPembayaranBulanan {
        status: boolean;
        message: string;
        data: IRekapTagihanBulanan[]
    }

    export class IDetailPembayaranBulanan {
        id_payment: number;
        id_invoice: number;
        invoice_number: string;
        invoice_date: Date;
        total: number;
        id_pelanggan: number;
        id_setting_company: number;
        company_name: string;
        full_name: string;
        pelanggan_code: string;
        id_product: number;
        product_name: string;
        payment_token: string;
        payment_id: string;
        payment_number: string;
        payment_date: Date;
        payment_method: string;
        payment_status: string;
        payment_amount: number;
        payment_provider: string;
        create_at: Date;
        create_by: number;
        update_at: Date;
        update_by: number;
    }

    export class GetDetailPembayaranBulanan {
        status: boolean;
        message: string;
        data: IDetailPembayaranBulanan[]
    }

    export class ITagihanKsoMitra {
        id_setting_company: number;
        periode: string;
        company_name: string;
        company_address: string;
        jumlah_pelanggan: number;
        jumlah_pemasukan: number;
        total_bhp_uso: number;
        total_pph_final: number;
        total_kso: number;
        total_tagihan: number;
        status_bayar: string;
    }

    export class GetTagihanKsoMitra {
        status: boolean;
        message: string;
        data: ITagihanKsoMitra[]
    }

    export class IUpdateTagihanKsoMitra {
        id_tagihan_kso: number;
        id_setting_company: number;
        periode: string;
        company_name: string;
        company_address: string;
        jumlah_pelanggan: number;
        jumlah_pemasukan: number;
        total_bhp_uso: number;
        total_pph_final: number;
        total_kso: number;
        total_tagihan: number;
        status_bayar: string;
    }
}