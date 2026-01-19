'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, Booking } from '@/lib/api';
import {
    AlertCircle,
    CalendarCheck,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

type StatusFilter = 'ALL' | 'CONFIRMED' | 'USED' | 'EXPIRED' | 'CANCELLED';

export default function BookingsPage() {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data, isLoading, error } = useQuery({
        queryKey: ['bookings', statusFilter, page],
        queryFn: () => adminApi.getBookings({
            status: statusFilter === 'ALL' ? undefined : statusFilter,
            page,
            limit,
        }),
    });

    const statusTabs: { label: string; value: StatusFilter; icon: any; color: string }[] = [
        { label: 'All', value: 'ALL', icon: CalendarCheck, color: 'text-[var(--foreground)]' },
        { label: 'Confirmed', value: 'CONFIRMED', icon: CheckCircle2, color: 'text-emerald-500' },
        { label: 'Used', value: 'USED', icon: CheckCircle2, color: 'text-blue-500' },
        { label: 'Expired', value: 'EXPIRED', icon: Clock, color: 'text-[var(--muted)]' },
        { label: 'Cancelled', value: 'CANCELLED', icon: XCircle, color: 'text-red-500' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-500">CONFIRMED</span>;
            case 'USED':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-500">USED</span>;
            case 'EXPIRED':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[var(--muted)]/20 text-[var(--muted)]">EXPIRED</span>;
            case 'CANCELLED':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-500">CANCELLED</span>;
            default:
                return null;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--primary)] border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-xl p-6 text-[var(--error)] flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                Failed to load bookings. Please try again.
            </div>
        );
    }

    const bookings = data?.data || [];
    const totalPages = data?.totalPages || 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)]">Bookings</h1>
                <p className="text-[var(--muted)] mt-1">
                    Monitor all platform bookings
                </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {statusTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => {
                                setStatusFilter(tab.value);
                                setPage(1);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === tab.value
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-hover)]'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${statusFilter === tab.value ? 'text-white' : tab.color}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Stats */}
            <div className="text-sm text-[var(--muted)]">
                Showing {bookings.length} of {data?.total || 0} booking{data?.total !== 1 ? 's' : ''}
            </div>

            {/* Bookings Table */}
            {bookings.length > 0 ? (
                <>
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border)]">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--muted)]">Booking Code</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--muted)]">User</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--muted)]">Gym</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--muted)]">Date</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--muted)]">Amount</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--muted)]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {bookings.map((booking: Booking) => (
                                    <tr key={booking.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-medium text-[var(--foreground)]">{booking.bookingCode}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-[var(--foreground)]">{booking.user.name || 'N/A'}</p>
                                            <p className="text-xs text-[var(--muted)]">{booking.user.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-[var(--foreground)]">{booking.gym.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-[var(--foreground)]">{formatDate(booking.bookingDate)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-[var(--primary)]">{formatCurrency(booking.amount)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-[var(--muted)]">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1 px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
                    <CalendarCheck className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">No bookings found</h3>
                    <p className="text-[var(--muted)]">
                        {statusFilter === 'ALL'
                            ? 'No bookings have been made yet.'
                            : `No ${statusFilter.toLowerCase()} bookings found.`}
                    </p>
                </div>
            )}
        </div>
    );
}
