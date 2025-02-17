import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/authentication/jwt.guard';
import { PaymentModel } from './payment.model';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';

@Controller('payment')
@ApiTags('Payment')
export class PaymentController {

    constructor(
        private _paymentService: PaymentService,
    ) { }

    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetAllPayment })
    async getAll(@Query() query: PaymentModel.IPaymentQueryParams, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.getAll(req, query);
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

    @Get('retrieve/:id_payment')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async getById(@Param('id_payment') id_payment: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.getById(id_payment);
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

    @Get('get-checkout-url/:id_invoice')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetAllPayment })
    async getCheckoutPageUrl(@Param('id_invoice') id_invoice: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.getCheckoutPageUrl(id_invoice);
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

    @Get('get-from-token/:token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetAllPayment })
    async getFromToken(@Param('token') token: string, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.getDataFromTokenCheckout(token);
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

    @Post('get-all-payment-method')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetAllPayment })
    async getAllPaymentMethod(@Body() body: PaymentModel.GetAllPaymentMethod, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.getPaymentMethod(body);
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

    @Post('payment')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async payment(@Body() body: PaymentModel.CreatePayment, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.payment(req, body);
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

    @Put('edit-payment')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async editPayment(@Body() body: PaymentModel.UpdatePayment, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.edit_payment(req, body);
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
