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
        const endpoint = req['params']['0'];

        if (endpoint.includes('authentication')) {
            return next();
        };

        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            // Extract IP
            const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            // Parse browser info
            const agent = useragent.parse(req.headers['user-agent'] || '');

            // Extract user from JWT token
            let id_user: number | null = null;
            const authHeader = req.headers['authorization'];

            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const decoded: any = this.jwtService.verify(token);
                    id_user = decoded?.id_user || null;
                } catch (err) {
                    console.warn('Invalid JWT token:', err.message);
                }
            }

            const payloadCreate = {
                id_user: id_user,
                endpoint: endpoint,
                method: req.method,
                request_body: ['POST', 'PUT', 'PATCH'].includes(req.method)
                    ? req.body
                    : {},
                ip_address: String(ipAddress),
                browser: agent.toString(),
            };

            // Save log only if user is authenticated
            await this.prisma.log_activity_user.create({
                data: payloadCreate
            });

            next();
        };

        if (req.method == 'GET') {
            return next();
        };
    }
}
