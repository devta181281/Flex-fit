'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, Owner } from '@/lib/api';
import { Search, UserCog, Calendar, Mail, Phone, Building2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function OwnersPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 15;

    const { data, isLoading, error } = useQuery({
        queryKey: ['owners', search, page],
        queryFn: () => adminApi.getGymOwners({ search: search || undefined, page, limit }),
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
                    <h1 className="text-3xl font-bold text-[var(--foreground)]">Gym Owners</h1>
                    <p className="text-[var(--muted)] mt-1">
                        {data?.total || 0} registered gym owners
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
                    Failed to load gym owners. Please try again.
                </div>
            )}

            {/* Owners Grid */}
            {data && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.data.map((owner) => (
                            <div key={owner.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary)]/30 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <UserCog className="w-6 h-6 text-[var(--primary)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-[var(--foreground)] truncate">{owner.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-[var(--muted)] mt-1">
                                            <Mail className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{owner.email}</span>
                                        </div>
                                        {owner.phone && (
                                            <div className="flex items-center gap-2 text-sm text-[var(--muted)] mt-1">
                                                <Phone className="w-4 h-4 flex-shrink-0" />
                                                <span>{owner.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border)]">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-[var(--muted)]" />
                                        <span className="text-sm text-[var(--foreground)]">{owner.gymCount} gyms</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span className="text-sm text-emerald-500">{owner.approvedGyms} approved</span>
                                    </div>
                                </div>

                                {/* Gyms List */}
                                {owner.gyms.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                        <p className="text-xs text-[var(--muted)] mb-2">Gyms:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {owner.gyms.slice(0, 3).map((gym) => (
                                                <span
                                                    key={gym.id}
                                                    className={`text-xs px-2 py-1 rounded-full ${gym.status === 'APPROVED'
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : gym.status === 'PENDING'
                                                                ? 'bg-amber-500/10 text-amber-500'
                                                                : 'bg-[var(--muted)]/10 text-[var(--muted)]'
                                                        }`}
                                                >
                                                    {gym.name.length > 15 ? gym.name.slice(0, 15) + '...' : gym.name}
                                                </span>
                                            ))}
                                            {owner.gyms.length > 3 && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-[var(--surface-hover)] text-[var(--muted)]">
                                                    +{owner.gyms.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Joined Date */}
                                <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-4">
                                    <Calendar className="w-3 h-3" />
                                    Joined {formatDate(owner.createdAt)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {data.data.length === 0 && (
                        <div className="text-center py-12 text-[var(--muted)] bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                            No gym owners found.
                        </div>
                    )}

                    {/* Pagination */}
                    {data.totalPages > 1 && (
                        <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl px-6 py-4">
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
                </>
            )}
        </div>
    );
}
