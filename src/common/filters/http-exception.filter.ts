import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '../../observability/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private logger: LoggerService) { }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: typeof message === 'string' ? message : (message as any).message,
        };

        // Log error
        this.logger.error(
            `HTTP ${status} Error: ${JSON.stringify(errorResponse)}`,
            exception instanceof Error ? exception.stack : undefined,
            'HttpExceptionFilter',
        );

        response.status(status).json(errorResponse);
    }
}
