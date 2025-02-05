import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/authentication/jwt.guard';
import { GroupPelangganModel } from './group-pelanggan.model';
import { GroupPelangganService } from './group-pelanggan.service';
import { Request, Response } from 'express';

@Controller('group-pelanggan')
@ApiTags('Group Pelanggan')
export class GroupPelangganController {

    constructor(
        private _groupPelangganService: GroupPelangganService,
    ) { }

    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: GroupPelangganModel.GetAllGroupPelanggan })
    async getAll(@Query() query: GroupPelangganModel.IGroupPelangganQueryParams, @Res() res: Response): Promise<any> {
        try {
            const data = await this._groupPelangganService.getAll(query);
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

    @Get('retrieve/:id_group_pelanggan')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: GroupPelangganModel.GetByIdGroupPelanggan })
    async getById(@Param('id_group_pelanggan') id_group_pelanggan: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._groupPelangganService.getById(id_group_pelanggan);
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
    @ApiResponse({ status: 200, description: 'Success', type: GroupPelangganModel.GetByIdGroupPelanggan })
    async create(@Body() body: GroupPelangganModel.CreateGroupPelanggan, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._groupPelangganService.create(req, body);
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
    @ApiResponse({ status: 200, description: 'Success', type: GroupPelangganModel.GetByIdGroupPelanggan })
    async update(@Body() body: GroupPelangganModel.UpdateGroupPelanggan, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._groupPelangganService.update(req, body);
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
