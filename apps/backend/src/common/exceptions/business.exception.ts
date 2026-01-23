import { HttpException, HttpStatus } from '@nestjs/common';
import { MESSAGES } from '../constants';

/**
 * Business Logic Exception
 * Use for business rule violations
 */
export class BusinessException extends HttpException {
    constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
        super(
            {
                success: false,
                error: 'Business Rule Violation',
                message,
            },
            statusCode,
        );
    }
}

/**
 * Resource Not Found Exception
 */
export class ResourceNotFoundException extends HttpException {
    constructor(resource: string = 'Resource') {
        super(
            {
                success: false,
                error: 'Not Found',
                message: `${resource} not found`,
            },
            HttpStatus.NOT_FOUND,
        );
    }
}

/**
 * Booking Limit Exception
 */
export class BookingLimitException extends HttpException {
    constructor(limit: number) {
        super(
            {
                success: false,
                error: 'Booking Limit Reached',
                message: `You have reached the maximum limit of ${limit} bookings`,
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}

/**
 * Invalid QR Code Exception
 */
export class InvalidQRException extends HttpException {
    constructor(message: string = MESSAGES.QR_INVALID) {
        super(
            {
                success: false,
                error: 'Invalid QR Code',
                message,
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}

/**
 * Rate Limit Exception
 */
export class RateLimitException extends HttpException {
    constructor() {
        super(
            {
                success: false,
                error: 'Too Many Requests',
                message: MESSAGES.TOO_MANY_REQUESTS,
            },
            HttpStatus.TOO_MANY_REQUESTS,
        );
    }
}
