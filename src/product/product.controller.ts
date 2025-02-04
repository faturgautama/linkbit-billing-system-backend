import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtGuard } from 'src/authentication/jwt.guard';
import { ProductModel } from './product.model';
import { ProductService } from './product.service';

@Controller('product')
@ApiTags('Product')
export class ProductController {

    constructor(
        private _productService: ProductService,
    ) { }

    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: ProductModel.GetAllProduct })
    async getAll(@Query() query: ProductModel.IProductQueryParams, @Res() res: Response): Promise<any> {
        try {
            const data = await this._productService.getAll(query);
            return res.status(HttpStatus.OK).json(data);
        } catch (error) {
            const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Get('retrieve/:id_product')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: ProductModel.GetByIdProduct })
    async getById(@Param('id_product') id_product: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._productService.getById(id_product);
            return res.status(HttpStatus.OK).json(data);

        } catch (error) {
            const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Post()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: ProductModel.GetByIdProduct })
    async create(@Body() body: ProductModel.CreateProduct, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._productService.create(req, body);
            return res.status(HttpStatus.OK).json(data);

        } catch (error) {
            const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Put()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: ProductModel.GetByIdProduct })
    async update(@Body() body: ProductModel.UpdateProduct, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._productService.update(req, body);
            return res.status(HttpStatus.OK).json(data);

        } catch (error) {
            const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }
}
