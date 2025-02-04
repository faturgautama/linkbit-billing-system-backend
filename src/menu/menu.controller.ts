import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtGuard } from 'src/authentication/jwt.guard';
import { MenuModel } from './menu.model';
import { MenuService } from './menu.service';

@Controller('menu')
@ApiTags('Menu')
export class MenuController {

    constructor(
        private _menuService: MenuService,
    ) { }

    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: MenuModel.GetAllMenu })
    async getAll(@Query() query: MenuModel.IMenuQueryParams, @Res() res: Response): Promise<any> {
        try {
            const data = await this._menuService.getAll(query);
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

    @Get('retrieve/:id_menu')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: MenuModel.GetByIdMenu })
    async getById(@Param('id_menu') id_menu: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._menuService.getById(id_menu);
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
    @ApiResponse({ status: 200, description: 'Success', type: MenuModel.GetByIdMenu })
    async create(@Body() body: MenuModel.CreateMenu, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._menuService.create(req, body);
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
    @ApiResponse({ status: 200, description: 'Success', type: MenuModel.GetByIdMenu })
    async update(@Body() body: MenuModel.UpdateMenu, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._menuService.update(req, body);
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
