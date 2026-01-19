'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from './theme';
import { ReactNode, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: 1,
                    },
                },
            })
    );

    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    {children}
                    <ThemedToaster />
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}

// Separate component that uses useTheme - must be inside ThemeProvider
function ThemedToaster() {
    // Use CSS variables instead of useTheme hook to avoid hydration issues
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    background: 'var(--surface)',
                    color: 'var(--foreground)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                },
                success: {
                    iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
}
