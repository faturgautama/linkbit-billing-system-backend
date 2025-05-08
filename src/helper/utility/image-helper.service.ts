import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageHelperService {
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
}