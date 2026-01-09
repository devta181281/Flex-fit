'use client';

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
export const api = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('adminToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Types
export interface AdminLoginResponse {
    user: {
        id: string;
        email: string;
        name: string;
    };
    accessToken: string;
    role: string;
}

export interface DashboardMetrics {
    totalGyms: number;
    approvedGyms: number;
    pendingGyms: number;
    totalBookings: number;
    totalRevenue: number;
}

export interface GymOwner {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface Gym {
    id: string;
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    dayPassPrice: number;
    amenities: string[];
    images: string[];
    openingHours: Record<string, string>;
    rules?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED';
    rejectReason?: string;
    rating: number;
    owner: GymOwner;
    createdAt: string;
    updatedAt: string;
}

export interface Booking {
    id: string;
    bookingCode: string;
    bookingDate: string;
    amount: number;
    status: 'CONFIRMED' | 'USED' | 'EXPIRED' | 'CANCELLED';
    gym: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

export interface BookingsResponse {
    data: Booking[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// API Service Functions
export const adminApi = {
    // Auth
    login: async (email: string, password: string): Promise<AdminLoginResponse> => {
        const response = await api.post<AdminLoginResponse>('/auth/admin/login', { email, password });
        return response.data;
    },

    // Dashboard
    getDashboardMetrics: async (): Promise<DashboardMetrics> => {
        const response = await api.get<DashboardMetrics>('/admin/dashboard');
        return response.data;
    },

    // Gyms
    getPendingGyms: async (): Promise<Gym[]> => {
        const response = await api.get<Gym[]>('/admin/gyms/pending');
        return response.data;
    },

    getAllGyms: async (status?: string): Promise<Gym[]> => {
        const response = await api.get<Gym[]>('/admin/gyms', { params: { status } });
        return response.data;
    },

    approveGym: async (gymId: string): Promise<Gym> => {
        const response = await api.patch<Gym>(`/admin/gyms/${gymId}/approve`);
        return response.data;
    },

    rejectGym: async (gymId: string, reason: string): Promise<Gym> => {
        const response = await api.patch<Gym>(`/admin/gyms/${gymId}/reject`, { reason });
        return response.data;
    },

    // Bookings
    getBookings: async (params?: {
        status?: string;
        gymId?: string;
        userId?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        limit?: number;
    }): Promise<BookingsResponse> => {
        const response = await api.get<BookingsResponse>('/admin/bookings', { params });
        return response.data;
    },
};
