import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtGuard } from 'src/authentication/jwt.guard';
import { PelangganModel } from './pelanggan.model';
import { PelangganService } from './pelanggan.service';

@Controller('pelanggan')
@ApiTags('Pelanggan')
export class PelangganController {

    constructor(
        private _pelangganService: PelangganService,
    ) { }

    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PelangganModel.GetAllPelanggan })
    async getAll(@Query() query: PelangganModel.IPelangganQueryParams, @Res() res: Response): Promise<any> {
        try {
            const data = await this._pelangganService.getAll(query);
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

    @Get('retrieve/:id_pelanggan')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PelangganModel.GetByIdPelanggan })
    async getById(@Param('id_pelanggan') id_pelanggan: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._pelangganService.getById(id_pelanggan);
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
    @ApiResponse({ status: 200, description: 'Success', type: PelangganModel.GetByIdPelanggan })
    async create(@Body() body: PelangganModel.CreatePelanggan, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._pelangganService.create(req, body);
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
    @ApiResponse({ status: 200, description: 'Success', type: PelangganModel.GetByIdPelanggan })
    async update(@Body() body: PelangganModel.UpdatePelanggan, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._pelangganService.update(req, body);
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
