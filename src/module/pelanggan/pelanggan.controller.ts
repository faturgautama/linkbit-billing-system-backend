import { Body, Controller, Get, Header, HttpStatus, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PelangganModel } from './pelanggan.model';
import { PelangganService } from './pelanggan.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { join } from 'path';
import { JwtGuard } from '../authentication/jwt.guard';

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
    async getAll(@Query() query: PelangganModel.IPelangganQueryParams, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._pelangganService.getAll(req, query);
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

    @Get('not-have-product')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PelangganModel.GetAllPelanggan })
    async getAllNotHaveProduct(@Query() query: PelangganModel.IPelangganQueryParams, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._pelangganService.getAllNotHaveProduct(req, query);
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

    @Put('delete/:id_pelanggan')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PelangganModel.GetByIdPelanggan })
    async delete(@Param('id_pelanggan') id_pelanggan: string, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._pelangganService.delete(req, id_pelanggan);
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

    @Put('update-product-pelanggan')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PelangganModel.GetByIdPelanggan })
    async updateProductPelanggan(@Body() body: PelangganModel.UpdateProductPelanggan, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._pelangganService.updateProductPelanggan(req, body);
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

    @Put('update-many-product-pelanggan')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: PelangganModel.GetByIdPelanggan })
    async updateManyProductPelanggan(@Body() body: PelangganModel.UpdateManyProductPelanggan, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._pelangganService.updateManyProductPelanggan(req, body);
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

    @Post('import')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Success' })
    @UseInterceptors(FileInterceptor('file'))
    async importPelanggan(@UploadedFile() file: any, @Req() req: Request, @Res() res: Response) {
        try {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawData = XLSX.utils.sheet_to_json(worksheet);
            const id_setting_company = parseInt(req['user']?.['id_setting_company'] as any);
            const create_by = parseInt(req['user']?.['id_user'] as any); // or whatever your user ID field is

            const result = await this._pelangganService.importFromExcel(rawData, {
                id_setting_company,
                create_by,
            });

            return res.status(HttpStatus.OK).json(result);

        } catch (error) {
            const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).json({
                status: false,
                message: error.message,
                data: null,
            });
        }
    }

    @Get('template-import')
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @Header('Content-Disposition', 'attachment; filename=pelanggan_import_template.xlsx')
    downloadTemplate(@Res() res: Response) {
        const filePath = join(process.cwd(), 'assets/pelanggan_import_template.xlsx');
        return res.download(filePath);
    }
}
