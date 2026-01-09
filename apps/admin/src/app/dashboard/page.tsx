'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { MetricCard } from '@/components/MetricCard';
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FF6B35] border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-500">
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
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-zinc-400 mt-1">Welcome back! Here's what's happening.</p>
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

            {/* Pending Approvals Section */}
            {pendingGyms && pendingGyms.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
                    <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                        <div>
                            <h2 className="text-xl font-semibold">Pending Approvals</h2>
                            <p className="text-sm text-zinc-400 mt-1">
                                {pendingGyms.length} gym{pendingGyms.length !== 1 ? 's' : ''} waiting for review
                            </p>
                        </div>
                        <Link
                            href="/dashboard/gyms/pending"
                            className="flex items-center gap-2 text-[#FF6B35] hover:underline"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-zinc-800">
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
                                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-zinc-600" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-medium">{gym.name}</h3>
                                        <p className="text-sm text-zinc-400">{gym.address}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-zinc-400">Owner: {gym.owner.name}</p>
                                    <p className="text-sm font-medium text-[#FF6B35]">
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
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-[#FF6B35]/50 transition-colors group"
                >
                    <Clock className="w-8 h-8 text-amber-500 mb-4" />
                    <h3 className="font-semibold group-hover:text-[#FF6B35] transition-colors">
                        Review Pending Gyms
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                        Approve or reject gym submissions
                    </p>
                </Link>
                <Link
                    href="/dashboard/gyms"
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-[#FF6B35]/50 transition-colors group"
                >
                    <Building2 className="w-8 h-8 text-blue-500 mb-4" />
                    <h3 className="font-semibold group-hover:text-[#FF6B35] transition-colors">
                        Manage All Gyms
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                        View and manage all registered gyms
                    </p>
                </Link>
                <Link
                    href="/dashboard/bookings"
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-[#FF6B35]/50 transition-colors group"
                >
                    <CalendarCheck className="w-8 h-8 text-emerald-500 mb-4" />
                    <h3 className="font-semibold group-hover:text-[#FF6B35] transition-colors">
                        View Bookings
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                        Monitor all platform bookings
                    </p>
                </Link>
            </div>
        </div>
    );
}
