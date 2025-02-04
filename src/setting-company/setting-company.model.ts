export namespace SettingCompanyModel {
    export class ISettingCompany {
        id_setting_company: number;
        company_name: string;
        company_email: string;
        company_short_name: string;
        company_address: string;
        company_phone: string;
        company_whatsapp: string;
        compny_email_admin: string;
        company_nomor_rekening: string;
        company_bank_name: string;
        tagihan_ppn: number;
        tagihan_jatuh_tempo: number;
        tagihan_use_unik_kode: boolean;
        tagihan_biaya_admin: number
        tagihan_pesan_invoice: string;
        tagihan_pesan_lunas: string;
        tagihan_editor_invoice: string;
        tagihan_editor_pos: string;
        update_at: Date;
        update_by: number;
    }

    export class GetAllSettingCompany {
        status: boolean;
        message: string;
        data: ISettingCompany[]
    }

    export class GetByIdSettingCompany {
        status: boolean;
        message: string;
        data: ISettingCompany;
    }

    export class UpdateSettingCompany {
        id_setting_company: number;
        company_name: string;
        company_email: string;
        company_short_name: string;
        company_address: string;
        company_phone: string;
        company_whatsapp: string;
        compny_email_admin: string;
        company_nomor_rekening: string;
        company_bank_name: string;
        tagihan_ppn: number;
        tagihan_jatuh_tempo: number;
        tagihan_use_unik_kode: boolean;
        tagihan_biaya_admin: number;
        tagihan_pesan_invoice: string;
        tagihan_pesan_lunas: string;
        tagihan_editor_invoice: string;
        tagihan_editor_pos: string;
    }
}