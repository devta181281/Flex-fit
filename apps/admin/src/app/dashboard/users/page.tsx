'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, User } from '@/lib/api';
import { Search, Users, Calendar, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';

export default function UsersPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 15;

    const { data, isLoading, error } = useQuery({
        queryKey: ['users', search, page],
        queryFn: () => adminApi.getUsers({ search: search || undefined, page, limit }),
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--foreground)]">Users</h1>
                    <p className="text-[var(--muted)] mt-1">
                        {data?.total || 0} registered users
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                />
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--primary)] border-t-transparent" />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-xl p-6 text-[var(--error)]">
                    Failed to load users. Please try again.
                </div>
            )}

            {/* Users Table */}
            {data && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border)]">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">User</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Contact</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Bookings</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {data.data.map((user) => (
                                <tr key={user.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <Users className="w-5 h-5 text-[var(--primary)]" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--foreground)]">{user.name || 'Unnamed User'}</p>
                                                <p className="text-xs text-[var(--muted)]">ID: {user.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                                                <Mail className="w-4 h-4 text-[var(--muted)]" />
                                                {user.email}
                                            </div>
                                            {user.phone && (
                                                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                                    <Phone className="w-4 h-4" />
                                                    {user.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
                                            {user.bookingCount} bookings
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(user.createdAt)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Empty State */}
                    {data.data.length === 0 && (
                        <div className="text-center py-12 text-[var(--muted)]">
                            No users found.
                        </div>
                    )}

                    {/* Pagination */}
                    {data.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
                            <p className="text-sm text-[var(--muted)]">
                                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of {data.total}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-[var(--foreground)]">
                                    Page {page} of {data.totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                                    disabled={page === data.totalPages}
                                    className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
