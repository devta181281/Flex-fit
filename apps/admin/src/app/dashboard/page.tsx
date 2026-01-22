'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { MetricCard } from '@/components/MetricCard';
import { BookingTrendChart, GymStatusChart, RevenueByGymChart } from '@/components/Charts';
import {
    Building2,
    CheckCircle2,
    Clock,
    CalendarCheck,
    IndianRupee,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { data: metrics, isLoading, error } = useQuery({
        queryKey: ['dashboardMetrics'],
        queryFn: adminApi.getDashboardMetrics,
    });

    const { data: pendingGyms } = useQuery({
        queryKey: ['pendingGyms'],
        queryFn: adminApi.getPendingGyms,
    });

    const { data: bookingTrends } = useQuery({
        queryKey: ['bookingTrends'],
        queryFn: () => adminApi.getBookingTrends(7),
    });

    const { data: gymStatus } = useQuery({
        queryKey: ['gymStatus'],
        queryFn: adminApi.getGymStatusDistribution,
    });

    const { data: revenueByGym } = useQuery({
        queryKey: ['revenueByGym'],
        queryFn: adminApi.getRevenueByGym,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--primary)] border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-xl p-6 text-[var(--error)]">
                Failed to load dashboard data. Please try again.
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
                <p className="text-[var(--muted)] mt-1">Welcome back! Here's what's happening.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <MetricCard
                    title="Total Gyms"
                    value={metrics?.totalGyms || 0}
                    icon={Building2}
                />
                <MetricCard
                    title="Approved Gyms"
                    value={metrics?.approvedGyms || 0}
                    icon={CheckCircle2}
                    color="success"
                />
                <MetricCard
                    title="Pending Approval"
                    value={metrics?.pendingGyms || 0}
                    icon={Clock}
                    color="warning"
                />
                <MetricCard
                    title="Total Bookings"
                    value={metrics?.totalBookings || 0}
                    icon={CalendarCheck}
                />
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(metrics?.totalRevenue || 0)}
                    icon={IndianRupee}
                    color="primary"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bookingTrends && <BookingTrendChart data={bookingTrends} />}
                {gymStatus && gymStatus.length > 0 && <GymStatusChart data={gymStatus} />}
            </div>

            {/* Revenue Chart */}
            {revenueByGym && <RevenueByGymChart data={revenueByGym} />}

            {/* Pending Approvals Section */}
            {pendingGyms && pendingGyms.length > 0 && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                    <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--foreground)]">Pending Approvals</h2>
                            <p className="text-sm text-[var(--muted)] mt-1">
                                {pendingGyms.length} gym{pendingGyms.length !== 1 ? 's' : ''} waiting for review
                            </p>
                        </div>
                        <Link
                            href="/dashboard/gyms/pending"
                            className="flex items-center gap-2 text-[var(--primary)] hover:underline"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                        {pendingGyms.slice(0, 3).map((gym) => (
                            <div key={gym.id} className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {gym.images[0] ? (
                                        <img
                                            src={gym.images[0]}
                                            alt={gym.name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-[var(--surface-hover)] flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-[var(--muted)]" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-medium text-[var(--foreground)]">{gym.name}</h3>
                                        <p className="text-sm text-[var(--muted)]">{gym.address}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[var(--muted)]">Owner: {gym.owner.name}</p>
                                    <p className="text-sm font-medium text-[var(--primary)]">
                                        ₹{gym.dayPassPrice}/day
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    href="/dashboard/gyms/pending"
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary)]/50 transition-colors group"
                >
                    <Clock className="w-8 h-8 text-amber-500 mb-4" />
                    <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                        Review Pending Gyms
                    </h3>
                    <p className="text-sm text-[var(--muted)] mt-1">
                        Approve or reject gym submissions
                    </p>
                </Link>
                <Link
                    href="/dashboard/gyms"
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary)]/50 transition-colors group"
                >
                    <Building2 className="w-8 h-8 text-blue-500 mb-4" />
                    <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                        Manage All Gyms
                    </h3>
                    <p className="text-sm text-[var(--muted)] mt-1">
                        View and manage all registered gyms
                    </p>
                </Link>
                <Link
                    href="/dashboard/bookings"
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary)]/50 transition-colors group"
                >
                    <CalendarCheck className="w-8 h-8 text-emerald-500 mb-4" />
                    <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                        View Bookings
                    </h3>
                    <p className="text-sm text-[var(--muted)] mt-1">
                        Monitor all platform bookings
                    </p>
                </Link>
            </div>
        </div>
    );
}
