'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, authLoading, router]);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FF6B35] border-t-transparent" />
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
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#FF6B35]">FlexFit</h1>
                    <p className="text-zinc-400 mt-2">Admin Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                    <h2 className="text-2xl font-semibold mb-6">Sign In</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@flexfit.com"
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-colors"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-colors"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-[#FF6B35] hover:bg-[#e55a28] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    <div className="mt-6 pt-6 border-t border-zinc-800">
                        <p className="text-xs text-zinc-500 text-center">
                            Demo: admin@flexfit.com / admin123
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
