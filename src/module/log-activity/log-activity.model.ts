export namespace LogActivityModel {
    export class ILogActivity {
        id_log_activity_user: number;
        id_user: number;
        full_name: string;
        endpoint: string;
        method: string;
        request_body: string;
        ip_address: string;
        browser: string;
        create_at: Date;
    }

    export class GetAllLogActivity {
        status: boolean;
        message: string;
        data: ILogActivity[]
    }


    export class ILogSendMessage {
        id_log_whatsapp_message: number;
        id_setting_company: number;
        id_invoice: number;
        no_ref: string;
        full_name: string;
        alamat: string;
        product_name: string;
        price: string;
        additional_info: any;
        sent_at: Date;
        sent_by: string;
        resent_at: Date;
        resent_by: string;
        status: string;
    }

    export class GetAllLogSendMessage {
        status: boolean;
        message: string;
        data: ILogSendMessage[]
    }
}