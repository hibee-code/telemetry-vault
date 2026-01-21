import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

// Extend Express Request to include tenant information
declare global {
    namespace Express {
        interface Request {
            tenantId?: string;
        }
    }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    private apiKeys: Map<string, string>;

    constructor(private configService: ConfigService) {
        this.apiKeys = this.configService.get<Map<string, string>>('app.apiKeys') ?? new Map();
    }

    use(req: Request, res: Response, next: NextFunction) {
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            throw new UnauthorizedException('Missing X-API-Key header');
        }

        const tenantId = this.apiKeys.get(apiKey);

        if (!tenantId) {
            throw new UnauthorizedException('Invalid API key');
        }

        // Attach tenant ID to request for downstream use
        req.tenantId = tenantId;

        next();
    }
}
