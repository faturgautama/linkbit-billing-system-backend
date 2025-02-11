import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationController } from './authentication/authentication.controller';
import { jwtConstants } from './authentication/jwt.secret';
import { AuthenticationService } from './authentication/authentication.service';
import { JwtStrategy } from './authentication/jwt.strategy';
import { UtilityService } from './utility/utility.service';
import { UserGroupController } from './user-group/user-group.controller';
import { UserGroupService } from './user-group/user-group.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { MenuController } from './menu/menu.controller';
import { MenuService } from './menu/menu.service';
import { UserGroupMenuController } from './user-group-menu/user-group-menu.controller';
import { UserGroupMenuService } from './user-group-menu/user-group-menu.service';
import { SettingCompanyController } from './setting-company/setting-company.controller';
import { SettingCompanyService } from './setting-company/setting-company.service';
import { ProductController } from './product/product.controller';
import { GroupPelangganController } from './group-pelanggan/group-pelanggan.controller';
import { ProductService } from './product/product.service';
import { GroupPelangganService } from './group-pelanggan/group-pelanggan.service';
import { PelangganController } from './pelanggan/pelanggan.controller';
import { InvoiceController } from './invoice/invoice.controller';
import { PelangganService } from './pelanggan/pelanggan.service';
import { InvoiceService } from './invoice/invoice.service';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret
        })
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
    ],
    providers: [
        JwtStrategy,
        PrismaService,
        UtilityService,
        AuthenticationService,
        UserService,
        UserGroupService,
        MenuService,
        UserGroupMenuService,
        SettingCompanyService,
        ProductService,
        GroupPelangganService,
        PelangganService,
        InvoiceService
    ],
})
export class AppModule { }
