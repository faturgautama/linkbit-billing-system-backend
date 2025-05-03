import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as useragent from 'useragent';

@Injectable()
export class ActivityLoggerMiddleware implements NestMiddleware {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        if (req.path.includes('authentication')) {
            return next();
        }

        // Extract IP
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Parse browser info
        const agent = useragent.parse(req.headers['user-agent'] || '');

        // Save log only if user is authenticated
        await this.prisma.log_activity_user.create({
            data: {
                id_user: req.user['id_user'],
                endpoint: req.originalUrl,
                method: req.method,
                request_body: ['POST', 'PUT', 'PATCH'].includes(req.method)
                    ? req.body
                    : {},
                ip_address: String(ipAddress),
                browser: agent.toString(),
            },
        });

        next();
    }
}
