import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type UserRole = 'USER' | 'OWNER' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    age?: number;
    gender?: string;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    role: UserRole | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Actions
    setAuth: (user: User, accessToken: string, role: UserRole) => Promise<void>;
    setUser: (user: User) => Promise<void>;
    clearAuth: () => Promise<void>;
    loadAuth: () => Promise<void>;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,

    setAuth: async (user, accessToken, role) => {
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        await SecureStore.setItemAsync('role', role);

        set({
            user,
            accessToken,
            role,
            isAuthenticated: true,
            isLoading: false,
        });
    },

    setUser: async (user) => {
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        set({ user });
    },

    clearAuth: async () => {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('user');
        await SecureStore.deleteItemAsync('role');

        set({
            user: null,
            accessToken: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },

    loadAuth: async () => {
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            const userStr = await SecureStore.getItemAsync('user');
            const role = (await SecureStore.getItemAsync('role')) as UserRole | null;

            if (accessToken && userStr && role) {
                const user = JSON.parse(userStr);
                set({
                    user,
                    accessToken,
                    role,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Error loading auth:', error);
            set({ isLoading: false });
        }
    },

    setLoading: (loading) => set({ isLoading: loading }),
}));
