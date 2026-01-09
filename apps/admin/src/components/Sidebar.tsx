'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Building2,
    ClipboardList,
    Clock,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pending Approvals', href: '/dashboard/gyms/pending', icon: Clock },
    { name: 'All Gyms', href: '/dashboard/gyms', icon: Building2 },
    { name: 'Bookings', href: '/dashboard/bookings', icon: ClipboardList },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-zinc-800">
                <Link href="/dashboard">
                    <h1 className="text-2xl font-bold text-[#FF6B35]">FlexFit</h1>
                    <p className="text-xs text-zinc-500 mt-1">Admin Panel</p>
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
                                    ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-sm font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
