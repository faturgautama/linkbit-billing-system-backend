import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/authentication/jwt.guard';
import { UserGroupMenuModel } from './user-group-menu.model';
import { UserGroupMenuService } from './user-group-menu.service';
import { Request, Response } from 'express';

@Controller('manajemen-menu')
@ApiTags('Manajemen Menu')
export class UserGroupMenuController {

    constructor(
        private _userGroupMenuService: UserGroupMenuService,
    ) { }

    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: UserGroupMenuModel.GetAllUserGroupMenu })
    async getAll(@Query() query: UserGroupMenuModel.IUserGroupMenuQueryParams, @Res() res: Response): Promise<any> {
        try {
            const data = await this._userGroupMenuService.getAll(query);
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

    @Get('assigned/:id_user_group')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: UserGroupMenuModel.GetAllUserGroupMenu })
    async getOnlyAssigned(@Param('id_user_group') id_user_group: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._userGroupMenuService.getOnlyAssigned(id_user_group);
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
    @ApiResponse({ status: 200, description: 'Success', type: UserGroupMenuModel.GetAllUserGroupMenu })
    async create(@Body() body: UserGroupMenuModel.CreateUserGroupMenu, @Res() res: Response): Promise<any> {
        try {
            const data = await this._userGroupMenuService.create(body);
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

    @Delete('/:id_user_group_menu')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: UserGroupMenuModel.GetAllUserGroupMenu })
    async update(@Param('id_user_group_menu') id_user_group_menu: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._userGroupMenuService.delete(id_user_group_menu);
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
