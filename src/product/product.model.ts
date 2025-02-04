export namespace ProductModel {
    export class IProduct {
        id_product: number;
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
        description: string;
        price: number;
        invoice_cycle: string;
        days_before_send_invoice: number;
    }

    export class UpdateProduct {
        id_product: number;
        description: string;
        price: number;
        invoice_cycle: string;
        days_before_send_invoice: number;
        is_active: boolean;
    }
}