import { Controller, Get, HttpStatus, Param, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { LogActivityService } from './log-activity.service';
import { LogActivityModel } from './log-activity.model';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/module/authentication/jwt.guard';
import { Request, Response } from 'express';

@Controller('log-activity')
@ApiTags('Log Activity')
export class LogActivityController {

    constructor(
        private _logActivityService: LogActivityService,
    ) { }

    @Get('activity')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: LogActivityModel.GetAllLogActivity })
    async getAllLogActivity(@Query() query: LogActivityModel.ILogQueryParams, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._logActivityService.getAllLogActivity(req, query);
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

    @Get('message')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: LogActivityModel.GetAllLogSendMessage })
    async getAllLogSendMessage(@Query() query: LogActivityModel.ILogQueryParams, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._logActivityService.getAllLogSendMessage(req, query);
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

    @Put('resent-message/:id_invoice')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: LogActivityModel.GetAllLogSendMessage })
    async resentMessage(@Param('id_invoice') id_invoice: number, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._logActivityService.resentLogSendMessage(id_invoice, req);
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
