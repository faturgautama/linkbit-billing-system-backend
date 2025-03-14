import { Body, Controller, Get, HttpStatus, Param, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LaporanService } from './laporan.service';
import { LaporanModel } from './laporan.model';
import { JwtGuard } from 'src/authentication/jwt.guard';
import { Request, Response } from 'express';

@Controller('laporan')
@ApiTags('Laporan')
export class LaporanController {

    constructor(
        private _laporanService: LaporanService,
    ) { }

    @Get('rekap-invoice-bulanan')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: LaporanModel.GetRekapPembayaranBulanan })
    async getAllRekapInvoice(@Query() query: LaporanModel.IQueryParamLaporanTagihan, @Res() res: Response): Promise<any> {
        try {
            const data = await this._laporanService.getRekapTagihanBulanan(query);
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

    @Get('detail-invoice-bulanan')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: LaporanModel.GetDetailTagihanBulanan })
    async getAllDetailInvoice(@Query() query: LaporanModel.IQueryParamLaporanTagihan, @Res() res: Response): Promise<any> {
        try {
            const data = await this._laporanService.getDetailTagihanBulanan(query);
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

    @Get('rekap-pembayaran-bulanan')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: LaporanModel.GetRekapPembayaranBulanan })
    async getAllRekapPembayaran(@Query() query: LaporanModel.IQueryParamLaporanPembayaran, @Res() res: Response): Promise<any> {
        try {
            const data = await this._laporanService.getRekapPembayaranBulanan(query);
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

    @Get('detail-pembayaran-bulanan')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: LaporanModel.GetDetailPembayaranBulanan })
    async getAllDetailPembayaran(@Query() query: LaporanModel.IQueryParamLaporanPembayaran, @Res() res: Response): Promise<any> {
        try {
            const data = await this._laporanService.getDetailPembayaranBulanan(query);
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

    @Get('tagihan-kso-mitra/:periode')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: LaporanModel.GetDetailPembayaranBulanan })
    async getTagihanKsoMitra(@Param('periode') periode: string, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._laporanService.getTagihanKsoMitra(req, periode);
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

    @Put('tagihan-kso-mitra')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: LaporanModel.GetDetailPembayaranBulanan })
    async updateTagihanKsoMitra(@Body() body: LaporanModel.IUpdateTagihanKsoMitra, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._laporanService.updateTagihanKsoMitra(req, body);
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
