import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserGroupService } from './user-group.service';
import { JwtGuard } from 'src/authentication/jwt.guard';
import { UserGroupModel } from './user-group.model';
import { Request, Response } from 'express';

@Controller('user-group')
@ApiTags('User Group')
export class UserGroupController {

    constructor(
        private _userGroupService: UserGroupService,
    ) { }

    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: UserGroupModel.GetAllUserGroup })
    async getAll(@Query() query: UserGroupModel.IUserGroupQueryParams, @Res() res: Response): Promise<any> {
        try {
            const data = await this._userGroupService.getAll(query);
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

    @Get('retrieve/:id_user_group')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: UserGroupModel.GetByIdUserGroup })
    async getById(@Param('id_user_group') id_user_group: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._userGroupService.getById(id_user_group);
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
    @ApiResponse({ status: 200, description: 'Success', type: UserGroupModel.GetByIdUserGroup })
    async create(@Body() body: UserGroupModel.CreateUserGroup, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._userGroupService.create(req, body);
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
    @ApiResponse({ status: 200, description: 'Success', type: UserGroupModel.GetByIdUserGroup })
    async update(@Body() body: UserGroupModel.UpdateUserGroup, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._userGroupService.update(req, body);
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
