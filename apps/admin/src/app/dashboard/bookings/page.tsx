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
        { label: 'All', value: 'ALL', icon: CalendarCheck, color: 'text-white' },
        { label: 'Confirmed', value: 'CONFIRMED', icon: CheckCircle2, color: 'text-emerald-500' },
        { label: 'Used', value: 'USED', icon: CheckCircle2, color: 'text-blue-500' },
        { label: 'Expired', value: 'EXPIRED', icon: Clock, color: 'text-zinc-500' },
        { label: 'Cancelled', value: 'CANCELLED', icon: XCircle, color: 'text-red-500' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-500">CONFIRMED</span>;
            case 'USED':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-500">USED</span>;
            case 'EXPIRED':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-zinc-500/20 text-zinc-500">EXPIRED</span>;
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
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FF6B35] border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-500 flex items-center gap-3">
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
                <h1 className="text-3xl font-bold">Bookings</h1>
                <p className="text-zinc-400 mt-1">
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
                                    ? 'bg-[#FF6B35] text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${statusFilter === tab.value ? 'text-white' : tab.color}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Stats */}
            <div className="text-sm text-zinc-400">
                Showing {bookings.length} of {data?.total || 0} booking{data?.total !== 1 ? 's' : ''}
            </div>

            {/* Bookings Table */}
            {bookings.length > 0 ? (
                <>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Booking Code</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">User</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Gym</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Date</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Amount</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {bookings.map((booking: Booking) => (
                                    <tr key={booking.id} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-medium">{booking.bookingCode}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm">{booking.user.name || 'N/A'}</p>
                                            <p className="text-xs text-zinc-500">{booking.user.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm">{booking.gym.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm">{formatDate(booking.bookingDate)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-[#FF6B35]">{formatCurrency(booking.amount)}</span>
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
                            <p className="text-sm text-zinc-400">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 px-3 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1 px-3 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                    <CalendarCheck className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
                    <p className="text-zinc-400">
                        {statusFilter === 'ALL'
                            ? 'No bookings have been made yet.'
                            : `No ${statusFilter.toLowerCase()} bookings found.`}
                    </p>
                </div>
            )}
        </div>
    );
}
