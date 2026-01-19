import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

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
    async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
    async (error) => {
        if (error.response?.status === 401) {
            await SecureStore.deleteItemAsync('accessToken');
        }
        return Promise.reject(error);
    }
);

// API service functions
export const apiService = {
    // Auth
    auth: {
        sendOTP: (email: string, role: string) =>
            api.post('/auth/send-otp', { email, role }),
        verifyOTP: (email: string, otp: string, role: string) =>
            api.post('/auth/verify-otp', { email, otp, role }),
    },

    // Users
    users: {
        getProfile: () => api.get('/users/me'),
        updateProfile: (data: any) => api.patch('/users/me', data),
        getBookings: () => api.get('/users/me/bookings'),
    },

    // Gyms
    gyms: {
        getNearby: (lat: number, lng: number, radiusKm?: number) =>
            api.get('/gyms', { params: { latitude: lat, longitude: lng, radiusKm } }),
        getById: (id: string) => api.get(`/gyms/${id}`),
        getMyGyms: () => api.get('/gyms/owner/my-gyms'),
        create: (data: any) => api.post('/gyms', data),
        update: (id: string, data: any) => api.patch(`/gyms/${id}`, data),
        getBookings: (gymId: string) => api.get(`/gyms/${gymId}/bookings`),
    },

    // Bookings
    bookings: {
        create: (data: any) => api.post('/bookings', data),
        createTestBooking: (gymId: string, bookingDate: string) =>
            api.post('/bookings/test-booking', { gymId, bookingDate }),
        getById: (id: string) => api.get(`/bookings/${id}`),
        getMy: () => api.get('/bookings/my'),
        validateQR: (gymId: string, bookingCode: string) =>
            api.post(`/bookings/gym/${gymId}/validate-qr`, { bookingCode }),
    },

    // Payments
    payments: {
        createOrder: (gymId: string, bookingDate: string) =>
            api.post('/payments/create-order', { gymId, bookingDate }),
        verify: (data: any) => api.post('/payments/verify', data),
    },
};
