'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminLoginResponse } from './api';

interface AdminUser {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: AdminUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing session
        const token = localStorage.getItem('adminToken');
        const storedUser = localStorage.getItem('adminUser');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response: AdminLoginResponse = await adminApi.login(email, password);

        localStorage.setItem('adminToken', response.accessToken);
        localStorage.setItem('adminUser', JSON.stringify(response.user));

        setUser(response.user);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
