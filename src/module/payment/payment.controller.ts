import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaymentModel } from './payment.model';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';
import { JwtGuard } from '../authentication/jwt.guard';

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
    // @UseGuards(JwtGuard)
    // @ApiBearerAuth('token')
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
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
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

    @Get('get-all-payment-method-for-internal')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetAllPaymentMethod })
    async getAllPaymentMethodForInternal(@Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.getPaymentMethodForInternal(req);
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

    @Get('get-all-payment-method/:token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetAllPaymentMethod })
    async getAllPaymentMethod(@Param('token') token: string, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.getPaymentMethod(token);
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

    @Post('create-payment')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async payment(@Body() body: PaymentModel.CreatePayment, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.payment(body);
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

    @Get('simulate-payment/:id_payment')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async simulatePayment(@Param('id_payment') id_payment: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.simulate(id_payment);
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

    @Post('callback')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async callbackPayment(@Body() payload: any, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.paymentCallback(payload);
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
            const data = await this._paymentService.editPayment(req, body);
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

    @Get('send-message/:id_payment')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async callback(@Param('id_payment') id_payment: number, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.sendMessage(req, id_payment);
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

    @Post('create-payment-cash')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async paymentCash(@Body() body: PaymentModel.CreatePaymentCash, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.paymentCash(req, body);
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

    @Put('cancel/:id_payment')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetByIdPayment })
    async cancel(@Param('id_payment') id_payment: string, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.cancel(req, parseInt(id_payment));
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

    @Get('change-payment-method/:token')
    @ApiResponse({ status: 200, description: 'Success', type: PaymentModel.GetAllPaymentMethod })
    async changePaymentMethod(@Param('token') token: string, @Res() res: Response): Promise<any> {
        try {
            const data = await this._paymentService.changePaymentMethod(token);
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
