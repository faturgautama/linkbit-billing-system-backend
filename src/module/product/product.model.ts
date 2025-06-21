import { IsNotEmpty, IsString, IsNumber, IsBoolean } from "class-validator";

export namespace ProductModel {
    export class IProduct {
        id_product: number;
        product_name: string;
        description: string;
        price: number;
        invoice_cycle: string;
        days_before_send_invoice: number;
        is_active: boolean;
        create_at: Date;
        create_by: number;
        update_at: Date;
        update_by: number;
    }

    export class IProductQueryParams {
        description?: string;
        price?: number;
    }

    export class GetAllProduct {
        status: boolean;
        message: string;
        data: IProduct[]
    }

    export class GetByIdProduct {
        status: boolean;
        message: string;
        data: IProduct;
    }

    export class CreateProduct {
        @IsNotEmpty()
        @IsString()
        product_name: string;

        @IsNotEmpty()
        @IsString()
        description: string;

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

    export class UpdateProduct {
        @IsNotEmpty()
        @IsNumber()
        id_product: number;

        @IsNotEmpty()
        @IsString()
        product_name: string;

        @IsNotEmpty()
        @IsString()
        description: string;

        @IsNotEmpty()
        @IsNumber()
        price: number;

        @IsNotEmpty()
        @IsString()
        invoice_cycle: string;

        @IsNotEmpty()
        @IsNumber()
        days_before_send_invoice: number;

        @IsNotEmpty()
        @IsBoolean()
        is_active: boolean;
    }
}