'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, Gym } from '@/lib/api';
import { GymDetailModal } from '@/components/GymDetailModal';
import { Building2, AlertCircle, CheckCircle2, Clock, XCircle, Ban } from 'lucide-react';

type StatusFilter = 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'DISABLED';

export default function AllGymsPage() {
    const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

    const { data: gyms, isLoading, error } = useQuery({
        queryKey: ['allGyms', statusFilter === 'ALL' ? undefined : statusFilter],
        queryFn: () => adminApi.getAllGyms(statusFilter === 'ALL' ? undefined : statusFilter),
    });

    const statusTabs: { label: string; value: StatusFilter; icon: any; color: string }[] = [
        { label: 'All', value: 'ALL', icon: Building2, color: 'text-[var(--foreground)]' },
        { label: 'Approved', value: 'APPROVED', icon: CheckCircle2, color: 'text-emerald-500' },
        { label: 'Pending', value: 'PENDING', icon: Clock, color: 'text-amber-500' },
        { label: 'Rejected', value: 'REJECTED', icon: XCircle, color: 'text-red-500' },
        { label: 'Disabled', value: 'DISABLED', icon: Ban, color: 'text-[var(--muted)]' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-500">APPROVED</span>;
            case 'PENDING':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-500">PENDING</span>;
            case 'REJECTED':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-500">REJECTED</span>;
            case 'DISABLED':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[var(--muted)]/20 text-[var(--muted)]">DISABLED</span>;
            default:
                return null;
        }
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
                Failed to load gyms. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)]">All Gyms</h1>
                <p className="text-[var(--muted)] mt-1">
                    Manage all registered gyms on the platform
                </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {statusTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
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
                Showing {gyms?.length || 0} gym{gyms?.length !== 1 ? 's' : ''}
            </div>

            {/* Gyms Table */}
            {gyms && gyms.length > 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border)]">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--muted)]">Gym</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--muted)]">Owner</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--muted)]">Price</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--muted)]">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--muted)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {gyms.map((gym) => (
                                <tr key={gym.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {gym.images[0] ? (
                                                <img
                                                    src={gym.images[0]}
                                                    alt={gym.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-[var(--surface-hover)] flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-[var(--muted)]" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-[var(--foreground)]">{gym.name}</p>
                                                <p className="text-sm text-[var(--muted)] line-clamp-1">{gym.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-[var(--foreground)]">{gym.owner.name}</p>
                                        <p className="text-xs text-[var(--muted)]">{gym.owner.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-[var(--primary)]">₹{gym.dayPassPrice}</span>
                                        <span className="text-[var(--muted)]">/day</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(gym.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedGym(gym)}
                                            className="text-sm text-[var(--primary)] hover:underline"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
                    <Building2 className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">No gyms found</h3>
                    <p className="text-[var(--muted)]">
                        {statusFilter === 'ALL'
                            ? 'No gyms have been registered yet.'
                            : `No ${statusFilter.toLowerCase()} gyms found.`}
                    </p>
                </div>
            )}

            {/* Gym Detail Modal */}
            {selectedGym && (
                <GymDetailModal
                    gym={selectedGym}
                    onClose={() => setSelectedGym(null)}
                    onApprove={() => { }}
                    onReject={() => { }}
                />
            )}
        </div>
    );
}
