import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
    private rateLimitStore = new Map<string, RateLimitEntry>();
    private windowMs: number;
    private maxRequests: number;

    constructor(private configService: ConfigService) {
        this.windowMs = this.configService.get<number>('app.rateLimit.windowMs') ?? 60000;
        this.maxRequests = this.configService.get<number>('app.rateLimit.maxRequests') ?? 1000;

        // Clean up expired entries every minute
        setInterval(() => this.cleanup(), 60000);
    }

    use(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.tenantId;

        if (!tenantId) {
            // If no tenant (shouldn't happen after auth middleware), skip rate limiting
            return next();
        }

        const now = Date.now();
        const key = `rate_limit:${tenantId}`;

        let entry = this.rateLimitStore.get(key);

        // Initialize or reset if window expired
        if (!entry || now > entry.resetTime) {
            entry = {
                count: 0,
                resetTime: now + this.windowMs,
            };
            this.rateLimitStore.set(key, entry);
        }

        entry.count++;

        // Set rate limit headers
        const remaining = Math.max(0, this.maxRequests - entry.count);
        const resetTime = Math.ceil(entry.resetTime / 1000);

        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', resetTime);

        // Check if limit exceeded
        if (entry.count > this.maxRequests) {
            const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfter);

            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: 'Rate limit exceeded',
                    retryAfter,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        next();
    }

    private cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.rateLimitStore.entries()) {
            if (now > entry.resetTime) {
                this.rateLimitStore.delete(key);
            }
        }
    }
}
