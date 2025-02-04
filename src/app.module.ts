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
    ],
    providers: [
        JwtStrategy,
        PrismaService,
        UtilityService,
        AuthenticationService,
        UserService,
        UserGroupService,
        MenuService,
    ],
})
export class AppModule { }
