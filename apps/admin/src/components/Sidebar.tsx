'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Building2,
    ClipboardList,
    Clock,
    LogOut,
    Moon,
    Sun,
    Users,
    UserCog
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/providers/theme';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pending Approvals', href: '/dashboard/gyms/pending', icon: Clock },
    { name: 'All Gyms', href: '/dashboard/gyms', icon: Building2 },
    { name: 'Bookings', href: '/dashboard/bookings', icon: ClipboardList },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Gym Owners', href: '/dashboard/owners', icon: UserCog },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { resolvedTheme, toggleTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-colors">
            {/* Logo */}
            <div className="p-6 border-b border-[var(--border)]">
                <Link href="/dashboard">
                    <h1 className="text-2xl font-bold text-[var(--primary)]">FlexFit</h1>
                    <p className="text-xs text-[var(--muted)] mt-1">Admin Panel</p>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                : 'text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Theme Toggle & User */}
            <div className="p-4 border-t border-[var(--border)]">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors mb-2"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-sm font-semibold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-[var(--muted)] truncate">{user?.email}</p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
