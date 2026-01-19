'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2, Sun, Moon } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        // Check current theme from document
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        if (newIsDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
        localStorage.setItem('flexfit-admin-theme', newIsDark ? 'dark' : 'light');
    };

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, authLoading, router]);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--primary)] border-t-transparent" />
            </div>
        );
    }

    // Don't render if authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            await login(email, password);
            toast.success('Login successful!');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Invalid credentials';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)] transition-colors">
            {/* Theme Toggle - only show when mounted */}
            {mounted && (
                <button
                    onClick={toggleTheme}
                    className="fixed top-6 right-6 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            )}

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[var(--primary)]">FlexFit</h1>
                    <p className="text-[var(--muted)] mt-2">Admin Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 transition-colors">
                    <h2 className="text-2xl font-semibold mb-6 text-[var(--foreground)]">Sign In</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@flexfit.com"
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo credentials hint */}
                    <div className="mt-6 pt-6 border-t border-[var(--border)]">
                        <p className="text-xs text-[var(--muted)] text-center">
                            Demo: admin@flexfit.com / admin123
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
