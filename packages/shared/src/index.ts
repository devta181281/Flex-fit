// ================================
// FlexFit Shared Types
// ================================

// Gym Status Enum
export enum GymStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    DISABLED = 'DISABLED',
}

// Booking Status Enum
export enum BookingStatus {
    CONFIRMED = 'CONFIRMED',
    USED = 'USED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

// Payment Status Enum
export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

// User Role Enum
export enum UserRole {
    USER = 'USER',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
}

// ================================
// User Types
// ================================

export interface User {
    id: string;
    email: string;
    phone?: string;
    name?: string;
    age?: number;
    gender?: string;
    avatar?: string;
    supabaseUid: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GymOwner {
    id: string;
    email: string;
    name: string;
    phone?: string;
    supabaseUid: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Admin {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

// ================================
// Gym Types
// ================================

export interface OpeningHours {
    mon?: string;
    tue?: string;
    wed?: string;
    thu?: string;
    fri?: string;
    sat?: string;
    sun?: string;
}

export interface Gym {
    id: string;
    name: string;
    description?: string;
    address: string;
    latitude: number;
    longitude: number;
    dayPassPrice: number;
    amenities: string[];
    images: string[];
    openingHours: OpeningHours;
    rules?: string;
    status: GymStatus;
    rejectReason?: string;
    rating: number;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GymWithDistance extends Gym {
    distance: number; // in kilometers
}

// ================================
// Booking Types
// ================================

export interface Booking {
    id: string;
    bookingCode: string;
    userId: string;
    gymId: string;
    bookingDate: Date;
    amount: number;
    status: BookingStatus;
    qrCode: string;
    paymentId?: string;
    usedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface BookingWithDetails extends Booking {
    gym: Gym;
    user?: User;
}

// ================================
// Payment Types
// ================================

export interface Payment {
    id: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    amount: number;
    status: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
}

// ================================
// API Request/Response Types
// ================================

// Auth
export interface SendOTPRequest {
    email: string;
    role: UserRole;
}

export interface VerifyOTPRequest {
    email: string;
    otp: string;
    role: UserRole;
}

export interface AuthResponse {
    user: User | GymOwner | Admin;
    accessToken: string;
    role: UserRole;
}

// Gyms
export interface GetGymsRequest {
    latitude: number;
    longitude: number;
    radiusKm?: number;
    minPrice?: number;
    maxPrice?: number;
}

export interface CreateGymRequest {
    name: string;
    description?: string;
    address: string;
    latitude: number;
    longitude: number;
    dayPassPrice: number;
    amenities: string[];
    images: string[];
    openingHours: OpeningHours;
    rules?: string;
}

export interface UpdateGymRequest extends Partial<CreateGymRequest> { }

// Bookings
export interface CreateBookingRequest {
    gymId: string;
    bookingDate: string; // ISO date string
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
}

export interface ValidateQRRequest {
    bookingCode: string;
}

export interface ValidateQRResponse {
    valid: boolean;
    booking?: BookingWithDetails;
    message: string;
}

// Payments
export interface CreatePaymentOrderRequest {
    gymId: string;
    bookingDate: string;
}

export interface CreatePaymentOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    gymName: string;
}

// Admin
export interface ApproveGymRequest {
    gymId: string;
}

export interface RejectGymRequest {
    gymId: string;
    reason: string;
}

// Dashboard Metrics
export interface AdminDashboardMetrics {
    totalGyms: number;
    approvedGyms: number;
    pendingGyms: number;
    totalBookings: number;
    totalRevenue: number;
}

// ================================
// API Response Wrapper
// ================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
