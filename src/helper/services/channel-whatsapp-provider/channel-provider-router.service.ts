import { HttpException, HttpStatus, Injectable, Scope } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { WhatsappChannelProviderModel } from './channel-provider.model';
import { LinkbitWapService } from "./provider/linkbit-wap.service";
import { Request } from "express";
import { QontakWapService } from "./provider/qontak-wap.service";

@Injectable({ scope: Scope.TRANSIENT })
export class ChannelProviderRouterService {

    constructor(
        private _prismaService: PrismaService,
        private _qontakWapService: QontakWapService,
        private _linkbitWapService: LinkbitWapService,
    ) { }

    async handleSendMessage(req: Request, type: WhatsappChannelProviderModel.MESSAGE_TYPE, data: any) {
        try {
            const id_setting_company = parseInt(req['user']['id_setting_company']);
            const channel_whatsapp_default = await this._prismaService
                .setting_channel_whatsapp
                .findFirst({
                    where: {
                        id_setting_company: id_setting_company,
                        is_active: true,
                        is_default: true
                    },
                    include: {
                        channel_whatsapp: true
                    }
                });

            if (!channel_whatsapp_default) {
                return {
                    status: false,
                    message: 'Channel Broadcast Whatsapp Belum Diatur'
                }
            };

            const send_result = channel_whatsapp_default.channel_whatsapp.channel_whatsapp.includes('QONTAK')
                ? await this._qontakWapService.handleSendMessage(type, data, channel_whatsapp_default)
                : await this._linkbitWapService.handleSendMessage(type, data, channel_whatsapp_default);

            await this._prismaService
                .log_whatsapp_message
                .create({
                    data: {
                        id_invoice: data.id_invoice,
                        id_setting_company: data.pelanggan.id_setting_company,
                        additional_info: data,
                        sent_at: new Date(),
                        sent_by: data.create_by,
                        status: send_result.status ? 'SUCCESS' : 'FAILED'
                    }
                });

            return {
                status: send_result.status,
                message: send_result.status ? 'Pesan berhasil dikirimkan' : send_result.data.msg,
                data: send_result.status ? data.id_invoice : null,
            };

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