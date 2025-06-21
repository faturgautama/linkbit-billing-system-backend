import { IsNotEmpty, IsNumber, IsDateString } from "class-validator";

export namespace PaymentModel {
    export class IPayment {
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

    export class IPaymentQueryParams {
        invoice_number?: string;
        invoice_date?: string;
        pelanggan_code?: string;
        full_name?: string;
        product_name?: string;
        payment_date?: string;
        payment_number?: string;
        payment_method?: string;
        payment_status?: string;
        search?: string;
    }

    export class GetAllPayment {
        status: boolean;
        message: string;
        data: IPayment[]
    }

    export class GetByIdPayment {
        status: boolean;
        message: string;
        data: IPayment;
    }

    export class CreatePayment {
        payment_token: string;
        payment_method_type: string;
        payment_method_code: string;
        payment_amount: number;
    }

    export class CreatePaymentCash {
        @IsNotEmpty()
        @IsNumber()
        id_invoice: number;

        @IsNotEmpty()
        @IsNumber()
        id_payment_method_manual: number;

        @IsNotEmpty()
        @IsDateString()
        payment_date: Date;

        @IsNotEmpty()
        @IsNumber()
        payment_amount: number;
    }

    export class UpdatePayment {
        id_payment: number;
        id_invoice: number;
        id_pelanggan: number;
        id_product: number;
        payment_token: string;
        payment_id: string;
        payment_number: string;
        payment_method_type: string;
        payment_method_code: string;
        payment_amount: number;
    }

    export class UpdatePaymentCash {
        @IsNotEmpty()
        @IsNumber()
        id_payment: number;

        @IsNotEmpty()
        @IsNumber()
        id_invoice: number;

        @IsNotEmpty()
        @IsNumber()
        id_payment_method_manual: number;

        @IsNotEmpty()
        @IsDateString()
        payment_date: Date;
    }

    export class IPaymentMethod {
        payment_method_type: string;
        payment_method_name: string;
        payment_method_code: string;
        image: string;
    }

    export class GetAllPaymentMethod {
        status: boolean;
        message: string;
        data: IPaymentMethod[];
    }
}