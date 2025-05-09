import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageHelperService {
    PaymentMethods = [
        {
            "payment_channel_logo": "https://static.xendit.co/logos/astrapay-logo.svg",
            "payment_channel": "ID_ASTRAPAY",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/linkaja-logo.svg",
            "payment_channel": "LINKAJA",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/ovo-logo.svg",
            "payment_channel": "OVO",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/shopeepay-logo-2.svg",
            "payment_channel": "SHOPEEPAY",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/alfamart-logo.svg",
            "payment_channel": "ALFAMART",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/indomaret-logo.svg",
            "payment_channel": "INDOMARET",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/qris-logo.svg",
            "payment_channel": "QRIS",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/bca-logo.svg",
            "payment_channel": "BCA",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/bjb-logo.svg",
            "payment_channel": "BJB",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/bni-logo.svg",
            "payment_channel": "BNI",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/bri-logo.svg",
            "payment_channel": "BRI",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/bsi-logo.svg",
            "payment_channel": "BSI",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/sampoerna-logo.svg",
            "payment_channel": "SAHABAT_SAMPOERNA",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/cimb-logo.svg",
            "payment_channel": "CIMB",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/mandiri-logo.svg",
            "payment_channel": "MANDIRI",
        },
        {
            "payment_channel_logo": "https://static.xendit.co/logos/new-logos/permata-logo.svg",
            "payment_channel": "PERMATA",
        }
    ];

    getBase64Image(imageName: string): string {
        try {
            // Path to the image in assets folder
            const imagePath = path.join(__dirname, '..', '..', 'assets', imageName);

            // Read image file as buffer
            const imageBuffer = fs.readFileSync(imagePath);

            if (!imageBuffer) {
                return "";
            }

            // Convert to Base64
            return `data:image/png;base64,${imageBuffer.toString('base64')}`;

        } catch (error) {
            throw new Error('Error reading image: ' + error.message);
        }
    }

    getImageUrl(payment_method_code: string): string {
        try {
            const payment_method = this.PaymentMethods.findIndex(item => item.payment_channel == payment_method_code);

            if (payment_method > 0) {
                return this.PaymentMethods[payment_method].payment_channel_logo;
            } else {
                return "";
            }

        } catch (error) {
            throw new Error('Error reading image: ' + error.message);
        }
    }
}