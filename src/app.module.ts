import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { AppGateway } from './app.gateway';

import { ActivityLoggerMiddleware } from './middleware/activity-log.middleware';

import { AuthenticationController } from './module/authentication/authentication.controller';
import { AuthenticationService } from './module/authentication/authentication.service';
import { jwtConstants } from './module/authentication/jwt.secret';
import { JwtStrategy } from './module/authentication/jwt.strategy';
import { UserGroupController } from './module/user-group/user-group.controller';
import { UserGroupService } from './module/user-group/user-group.service';
import { UserController } from './module/user/user.controller';
import { UserService } from './module/user/user.service';
import { MenuController } from './module/menu/menu.controller';
import { MenuService } from './module/menu/menu.service';
import { UserGroupMenuController } from './module/user-group-menu/user-group-menu.controller';
import { UserGroupMenuService } from './module/user-group-menu/user-group-menu.service';
import { SettingCompanyController } from './module/setting-company/setting-company.controller';
import { SettingCompanyService } from './module/setting-company/setting-company.service';
import { ProductController } from './module/product/product.controller';
import { GroupPelangganController } from './module/group-pelanggan/group-pelanggan.controller';
import { ProductService } from './module/product/product.service';
import { GroupPelangganService } from './module/group-pelanggan/group-pelanggan.service';
import { PelangganController } from './module/pelanggan/pelanggan.controller';
import { InvoiceController } from './module/invoice/invoice.controller';
import { PelangganService } from './module/pelanggan/pelanggan.service';
import { InvoiceService } from './module/invoice/invoice.service';
import { PaymentController } from './module/payment/payment.controller';
import { PaymentService } from './module/payment/payment.service';
import { DashboardController } from './module/dashboard/dashboard.controller';
import { DashboardService } from './module/dashboard/dashboard.service';
import { LaporanController } from './module/laporan/laporan.controller';
import { LaporanService } from './module/laporan/laporan.service';
import { TemplateEditorController } from './module/template-editor/template-editor.controller';
import { TemplateEditorService } from './module/template-editor/template-editor.service';
import { LogActivityService } from './module/log-activity/log-activity.service';
import { LogActivityController } from './module/log-activity/log-activity.controller';
import { ChannelWhatsappController } from './module/channel-whatsapp/channel-whatsapp.controller';
import { ChannelWhatsappService } from './module/channel-whatsapp/channel-whatsapp.service';

import { AxiosService } from './helper/utility/axios.service';
import { ImageHelperService } from './helper/utility/image-helper.service';
import { UtilityService } from './helper/utility/utility.service';
import { InvoiceCronService } from './scheduler/invoice-cron.service';
import { SendMessageCronService } from './scheduler/send-message-cron.service';
import { ChannelProviderRouterService } from './helper/services/channel-whatsapp-provider/channel-provider-router.service';
import { LinkbitWapService } from './helper/services/channel-whatsapp-provider/provider/linkbit-wap.service';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret
        }),
        HttpModule,
        ScheduleModule.forRoot(),
    ],
    controllers: [
        AuthenticationController,
        UserController,
        UserGroupController,
        MenuController,
        UserGroupMenuController,
        SettingCompanyController,
        ProductController,
        GroupPelangganController,
        PelangganController,
        InvoiceController,
        PaymentController,
        DashboardController,
        LaporanController,
        TemplateEditorController,
        LogActivityController,
        ChannelWhatsappController
    ],
    providers: [
        JwtStrategy,
        PrismaService,
        AuthenticationService,
        UserService,
        UserGroupService,
        MenuService,
        UserGroupMenuService,
        SettingCompanyService,
        ProductService,
        GroupPelangganService,
        PelangganService,
        InvoiceService,
        PaymentService,
        DashboardService,
        LaporanService,
        AxiosService,
        ImageHelperService,
        UtilityService,
        AppGateway,
        InvoiceCronService,
        SendMessageCronService,
        TemplateEditorService,
        LogActivityService,
        ChannelWhatsappService,
        LinkbitWapService,
        ChannelProviderRouterService
    ],
})
export class AppModule {

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ActivityLoggerMiddleware).forRoutes('*');
    }
}
