/**
 * Standard API Response Interface
 * All API responses follow this structure for consistency
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
}

/**
 * Paginated Response Interface
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/**
 * Error Response for validation errors
 */
export interface ValidationErrorResponse extends ApiResponse {
    errors?: {
        field: string;
        message: string;
    }[];
}
