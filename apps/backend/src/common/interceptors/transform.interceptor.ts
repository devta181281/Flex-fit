import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';
import { MESSAGES } from '../constants';

/**
 * Transform Interceptor
 * Wraps all successful responses in a consistent format
 */
@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        return next.handle().pipe(
            map((data) => {
                // If response already has success property, pass through
                if (data && typeof data === 'object' && 'success' in data) {
                    return data;
                }

                return {
                    success: true,
                    data,
                    message: MESSAGES.SUCCESS,
                    timestamp: new Date().toISOString(),
                };
            }),
        );
    }
}

/**
 * Logging Interceptor
 * Logs all incoming requests and outgoing responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body } = request;
        const userAgent = request.get('user-agent') || '';
        const now = Date.now();

        // Log request
        this.logger.log(
            `→ ${method} ${url} - ${userAgent.substring(0, 50)}`,
        );

        return next.handle().pipe(
            map((data) => {
                const response = context.switchToHttp().getResponse();
                const { statusCode } = response;
                const duration = Date.now() - now;

                // Log response
                this.logger.log(
                    `← ${method} ${url} - ${statusCode} - ${duration}ms`,
                );

                return data;
            }),
        );
    }
}
