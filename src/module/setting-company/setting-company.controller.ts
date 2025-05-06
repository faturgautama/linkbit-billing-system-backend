import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SettingCompanyService } from './setting-company.service';
import { JwtGuard } from '../authentication/jwt.guard';
import { Request, Response } from 'express';
import { SettingCompanyModel } from './setting-company.model';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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
    async getAll(@Query() query: SettingCompanyModel.ISettingCompanyQuery, @Res() res: Response): Promise<any> {
        try {
            const data = await this._settingCompanyService.getAll(query);
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

    @Get('retrieve/:id_setting_company')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: SettingCompanyModel.GetByIdSettingCompany })
    async getById(@Param('id_setting_company') id_setting_company: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._settingCompanyService.getById(id_setting_company);
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
    @ApiResponse({ status: 200, description: 'Success', type: SettingCompanyModel.GetByIdSettingCompany })
    async insert(@Body() body: SettingCompanyModel.CreateSettingCompany, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._settingCompanyService.create(req, body);
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

    @Get('payment-method-manual/:id_setting_company')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: SettingCompanyModel.GetByIdSettingCompany })
    async getAllPaymentMethodManual(@Param('id_setting_company') id_setting_company: number, @Res() res: Response): Promise<any> {
        try {
            const data = await this._settingCompanyService.getAllPaymentMethodManual(id_setting_company);
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

    @Post('payment-method-manual')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: SettingCompanyModel.GetAllSettingCompany })
    async insertPaymentMethodManual(@Body() body: SettingCompanyModel.CreatePaymentMethodManual, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._settingCompanyService.createPaymentMethodManual(req, body);
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

    @Put('payment-method-manual')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: SettingCompanyModel.GetByIdSettingCompany })
    async updatePaymentMethodManual(@Body() body: SettingCompanyModel.UpdatePaymentMethodManual, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._settingCompanyService.updatePaymentMethodManual(req, body);
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

    @Get('backup-database')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    async backupDatabase(@Res() res: Response): Promise<any> {
        try {
            const DB_NAME = process.env.DATABASE_NAME;
            const DB_USER = process.env.DATABASE_USER;
            const DB_PASSWORD = process.env.DATABASE_PASSWORD;
            const DB_HOST = process.env.DATABASE_HOST;

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const BACKUP_PATH = `/home/billing-system-fg-linkbit/backup/backup_${DB_NAME}_${timestamp}.sql`;

            exec(
                `pg_dump -U ${DB_USER} -h ${DB_HOST} -p 5432 ${DB_NAME} > ${BACKUP_PATH}`,
                { env: { ...process.env, PGPASSWORD: DB_PASSWORD } },
                (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Backup failed: ${error.message}`);
                        return {
                            status: false,
                            message: `Backup failed: ${error.message}`,
                            data: null
                        }
                    };

                    return {
                        status: true,
                        message: `Database backup created successfully at : ${BACKUP_PATH}`,
                        data: []
                    }
                }
            );

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
