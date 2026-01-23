import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP Exception Filter
 * Ensures all errors return a consistent response format
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const resp = exceptionResponse as Record<string, any>;
                message = resp.message || resp.error || message;
                error = resp.error || error;

                // Handle validation errors (class-validator)
                if (Array.isArray(resp.message)) {
                    message = resp.message.join(', ');
                }
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(
                `Unhandled error: ${exception.message}`,
                exception.stack,
            );
        }

        const errorResponse = {
            success: false,
            error,
            message,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        // Log error for debugging
        this.logger.error(
            `${request.method} ${request.url} - ${status} - ${message}`,
        );

        response.status(status).json(errorResponse);
    }
}
