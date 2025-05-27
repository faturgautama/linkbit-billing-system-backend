import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class GenerateMekariHeaderService {

    generate_headers(method: string, path: string, client_secret: string, client_id: string) {
        let datetime = new Date().toUTCString();
        let requestLine = `${method} ${path} HTTP/1.1`;
        let payload = [`date: ${datetime}`, requestLine].join("\n");
        let signature = crypto.createHmac('SHA256', client_secret).update(payload).digest('base64');

        return {
            'Content-Type': 'application/json',
            'Date': datetime,
            'Authorization': `hmac username="${client_id}", algorithm="hmac-sha256", headers="date request-line", signature="${signature}"`
        };
    }
}
