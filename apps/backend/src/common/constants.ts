/**
 * Application Constants
 * Centralized location for all shared constants
 */

// ==================== Business Rules ====================

export const BOOKING_CONSTANTS = {
    MAX_BOOKINGS_PER_USER: 16,
    MAX_ADVANCE_BOOKING_DAYS: 7,
    BOOKING_CODE_PREFIX: 'FLX-',
    BOOKING_CODE_LENGTH: 6,
} as const;

export const GYM_CONSTANTS = {
    MAX_IMAGES: 5,
    MAX_DESCRIPTION_LENGTH: 1000,
    DEFAULT_RADIUS_KM: 10,
    MAX_RADIUS_KM: 500,
} as const;

// ==================== Cache Keys & TTL ====================

export const CACHE_KEYS = {
    DASHBOARD_METRICS: 'admin:dashboard:metrics',
    GYM_LIST: 'gyms:list',
    GYM_DETAIL: 'gyms:detail:',
    BOOKING_TRENDS: 'admin:analytics:booking-trends',
    GYM_STATUS_DISTRIBUTION: 'admin:analytics:gym-status',
    REVENUE_BY_GYM: 'admin:analytics:revenue-by-gym',
} as const;

export const CACHE_TTL = {
    SHORT: 60,        // 1 minute
    MEDIUM: 300,      // 5 minutes
    LONG: 900,        // 15 minutes
    VERY_LONG: 3600,  // 1 hour
} as const;

// ==================== Rate Limiting ====================

export const RATE_LIMIT = {
    DEFAULT_TTL: 60,      // 60 seconds window
    DEFAULT_LIMIT: 100,   // 100 requests per window
    AUTH_TTL: 60,
    AUTH_LIMIT: 5,        // 5 auth attempts per minute
    PAYMENT_TTL: 60,
    PAYMENT_LIMIT: 10,    // 10 payment attempts per minute
} as const;

// ==================== API Response Messages ====================

export const MESSAGES = {
    // Success
    SUCCESS: 'Operation completed successfully',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    
    // Auth
    OTP_SENT: 'OTP sent successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    
    // Errors
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    BAD_REQUEST: 'Invalid request',
    INTERNAL_ERROR: 'Internal server error',
    TOO_MANY_REQUESTS: 'Too many requests, please try again later',
    
    // Booking
    BOOKING_LIMIT_REACHED: 'You have reached the maximum booking limit',
    BOOKING_CREATED: 'Booking created successfully',
    BOOKING_NOT_FOUND: 'Booking not found',
    QR_VALID: 'Check-in successful!',
    QR_INVALID: 'Invalid booking code',
    QR_ALREADY_USED: 'This booking has already been used',
    QR_EXPIRED: 'This booking has expired',
    
    // Gym
    GYM_NOT_FOUND: 'Gym not found',
    GYM_NOT_AVAILABLE: 'Gym is not available for booking',
    GYM_APPROVED: 'Gym approved successfully',
    GYM_REJECTED: 'Gym rejected',
} as const;

// ==================== User Roles ====================

export const ROLES = {
    USER: 'USER',
    GYM_OWNER: 'GYM_OWNER',
    ADMIN: 'ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
