import { Body, Controller, Get, HttpStatus, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SettingCompanyService } from './setting-company.service';
import { JwtGuard } from 'src/authentication/jwt.guard';
import { Request, Response } from 'express';
import { SettingCompanyModel } from './setting-company.model';

@Controller('setting-company')
@ApiTags('Setting Company')
export class SettingCompanyController {

    constructor(
        private _settingCompanyService: SettingCompanyService,
    ) { }

    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: SettingCompanyModel.GetByIdSettingCompany })
    async getAll(@Res() res: Response): Promise<any> {
        try {
            const data = await this._settingCompanyService.getById();
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
    @ApiResponse({ status: 200, description: 'Success', type: SettingCompanyModel.GetByIdSettingCompany })
    async update(@Body() body: SettingCompanyModel.UpdateSettingCompany, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._settingCompanyService.update(req, body);
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
