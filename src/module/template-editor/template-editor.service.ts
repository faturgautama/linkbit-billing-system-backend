import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TemplateEditorModel } from './template-editor.model';
import { Request, Response } from 'express';

@Injectable({ scope: Scope.TRANSIENT })
export class TemplateEditorService {

    constructor(
        private _prismaService: PrismaService,
    ) { }

    async getAll(): Promise<TemplateEditorModel.GetByIdTemplateEditor> {
        try {
            let res = await this._prismaService
                .template_editor
                .findFirst();

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async create(req: Request, payload: TemplateEditorModel.CreateTemplateEditor): Promise<any> {
        try {
            let res = await this._prismaService
                .template_editor
                .create({
                    data: {
                        ...payload,
                        create_at: new Date(),
                        create_by: parseInt(req['user']['id_user'] as any)
                    }
                })

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }

    async update(req: Request, payload: TemplateEditorModel.UpdateTemplateEditor): Promise<any> {
        try {
            const { id_template_editor, ...data } = payload

            let res = await this._prismaService
                .template_editor
                .update({
                    where: { id_template_editor: parseInt(id_template_editor as any) },
                    data: {
                        ...data,
                        update_at: new Date(),
                        update_by: parseInt(req['user']['id_user'] as any)
                    }
                })

            return {
                status: true,
                message: '',
                data: res
            }

        } catch (error) {
            const status = error.message.includes('not found')
                ? HttpStatus.NOT_FOUND
                : error.message.includes('bad request')
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(
                {
                    status: false,
                    message: error.message
                },
                status
            );
        }
    }
}
