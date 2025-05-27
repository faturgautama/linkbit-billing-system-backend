import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../authentication/jwt.guard';
import { Request, Response } from 'express';
import { ChannelWhatsappService } from './channel-whatsapp.service';
import { ChannelWhatsappModel } from './channel-whatsapp.model';

@Controller('channel-whatsapp')
@ApiTags('Channel Whatsapp')
export class ChannelWhatsappController {

    constructor(
        private _channelWhatsappService: ChannelWhatsappService,
    ) { }

    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: ChannelWhatsappModel.GetAllChannelWhatsapp })
    async getAll(@Query() query: ChannelWhatsappModel.IChannelWhatsappQueryParams, @Res() res: Response): Promise<any> {
        try {
            const data = await this._channelWhatsappService.getAll(query);
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

    @Get('retrieve/:id_channel_whatsapp')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: ChannelWhatsappModel.GetByIdChannelWhatsapp })
    async getById(@Param('id_channel_whatsapp') id_channel_whatsapp: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._channelWhatsappService.getById(id_channel_whatsapp);
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
    @ApiResponse({ status: 200, description: 'Success', type: ChannelWhatsappModel.GetByIdChannelWhatsapp })
    async create(@Body() body: ChannelWhatsappModel.CreateChannelWhatsapp, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._channelWhatsappService.create(req, body);
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
    @ApiResponse({ status: 200, description: 'Success', type: ChannelWhatsappModel.GetByIdChannelWhatsapp })
    async update(@Body() body: ChannelWhatsappModel.UpdateChannelWhatsapp, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._channelWhatsappService.update(req, body);
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
