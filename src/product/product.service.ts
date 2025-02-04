import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductModel } from './product.model';
import { Request, Response } from 'express';

@Injectable({ scope: Scope.TRANSIENT })
export class ProductService {

    constructor(
        private _prismaService: PrismaService,
    ) { }

    async getAll(query: ProductModel.IProductQueryParams): Promise<ProductModel.GetAllProduct> {
        try {
            let res: any[] = await this._prismaService
                .product
                .findMany({
                    where: Object.keys(query).reduce((aggregate, property) => {
                        if (property == 'price') {
                            aggregate[property] = parseInt(query[property] as any);
                        }
                        return aggregate;
                    }, {}),
                    orderBy: {
                        id_product: 'asc'
                    }
                });

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async getById(id_product: number): Promise<ProductModel.GetByIdProduct> {
        try {
            let res: any = await this._prismaService
                .product
                .findUnique({
                    where: { id_product: parseInt(id_product as any) }
                });

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async create(req: Request, payload: ProductModel.CreateProduct): Promise<any> {
        try {
            let res = await this._prismaService
                .product
                .create({
                    data: {
                        ...payload,
                        create_at: new Date(),
                        create_by: parseInt(req['user']['id_user'] as any)
                    }
                })

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async update(req: Request, payload: ProductModel.UpdateProduct): Promise<any> {
        try {
            const { id_product, ...data } = payload

            let res = await this._prismaService
                .product
                .update({
                    where: { id_product: parseInt(id_product as any) },
                    data: {
                        ...data,
                        update_at: new Date(),
                        update_by: parseInt(req['user']['id_user'] as any)
                    }
                })

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }
}
