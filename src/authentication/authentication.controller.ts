import { Body, Controller, Get, HttpStatus, Put, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticationModel } from './authentication.model';
import { AuthenticationService } from './authentication.service';
import { Request, Response } from 'express';
import { JwtGuard } from './jwt.guard';

@Controller('authentication')
@ApiTags('Authentication')
export class AuthenticationController {

    constructor(
        private _authenticationService: AuthenticationService,
    ) { }

    @Post('sign-in')
    @ApiResponse({ status: 200, description: 'Success', type: AuthenticationModel.Login })
    async signInCustomer(@Body() body: AuthenticationModel.ILogin, @Res() res: Response): Promise<any> {
        try {
            const data = await this._authenticationService.login(body.email, body.password);
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

    @Post('register')
    @ApiResponse({ status: 200, description: 'Success', type: AuthenticationModel.Login })
    async registerUser(@Body() body: AuthenticationModel.IRegister, @Res() res: Response): Promise<any> {
        try {
            const data = await this._authenticationService.register(body);
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

    @Get('profile')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: AuthenticationModel.GetProfile })
    async getProfile(@Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._authenticationService.getProfile(req);
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

    @Put('profile')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('token')
    @ApiResponse({ status: 200, description: 'Success', type: AuthenticationModel.GetProfile })
    async updateProfile(@Body() body: AuthenticationModel.UpdateProfile, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const data = await this._authenticationService.updateProfile(req, body);
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
