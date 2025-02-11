import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtGuard } from 'src/authentication/jwt.guard';
import { InvoiceModel } from './invoice.model';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
@ApiTags('Invoice')
export class InvoiceController {

    constructor(
        private _invoiceService: InvoiceService,
    ) { }

    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: InvoiceModel.GetAllInvoice })
    async getAll(@Query() query: InvoiceModel.IInvoiceQueryParams, @Res() res: Response): Promise<any> {
        try {
            const data = await this._invoiceService.getAll(query);
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

    @Get('retrieve/:id_invoice')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: InvoiceModel.GetByIdInvoice })
    async getById(@Param('id_invoice') id_invoice: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._invoiceService.getById(id_invoice);
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
    @ApiResponse({ status: 200, description: 'Success', type: InvoiceModel.GetByIdInvoice })
    async create(@Body() body: InvoiceModel.CreateInvoice, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._invoiceService.create(req, body);
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
    @ApiResponse({ status: 200, description: 'Success', type: InvoiceModel.GetByIdInvoice })
    async update(@Body() body: InvoiceModel.UpdateInvoice, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._invoiceService.update(req, body);
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

    @Delete(':/id_invoice')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: InvoiceModel.GetByIdInvoice })
    async delete(@Param('id_invoice') id_invoice: number, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._invoiceService.delete(req, id_invoice);
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
