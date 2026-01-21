import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../../observability/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private logger: LoggerService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, tenantId } = request;
        const startTime = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    const response = context.switchToHttp().getResponse();
                    const duration = Date.now() - startTime;

                    this.logger.logWithMetadata('info', 'HTTP Request', {
                        method,
                        url,
                        tenantId,
                        statusCode: response.statusCode,
                        duration: `${duration}ms`,
                    });
                },
                error: (error) => {
                    const duration = Date.now() - startTime;

                    this.logger.logWithMetadata('error', 'HTTP Request Failed', {
                        method,
                        url,
                        tenantId,
                        error: error.message,
                        duration: `${duration}ms`,
                    });
                },
            }),
        );
    }
}
