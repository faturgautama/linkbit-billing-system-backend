import { Body, Controller, Get, HttpStatus, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { TemplateEditorService } from './template-editor.service';
import { Request, Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/authentication/jwt.guard';
import { TemplateEditorModel } from './template-editor.model';

@Controller('template-editor')
@ApiTags('Template Editor')
export class TemplateEditorController {

    constructor(
        private _templateEditorService: TemplateEditorService,
    ) { }

    @Get()
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: TemplateEditorModel.GetAllTemplateEditor })
    async getAll(@Res() res: Response): Promise<any> {
        try {
            const data = await this._templateEditorService.getAll();
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
    @ApiResponse({ status: 200, description: 'Success', type: TemplateEditorModel.GetByIdTemplateEditor })
    async create(@Body() body: TemplateEditorModel.CreateTemplateEditor, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._templateEditorService.create(req, body);
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
    @ApiResponse({ status: 200, description: 'Success', type: TemplateEditorModel.GetByIdTemplateEditor })
    async update(@Body() body: TemplateEditorModel.UpdateTemplateEditor, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._templateEditorService.update(req, body);
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
