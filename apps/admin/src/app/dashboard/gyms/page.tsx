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
        { label: 'All', value: 'ALL', icon: Building2, color: 'text-white' },
        { label: 'Approved', value: 'APPROVED', icon: CheckCircle2, color: 'text-emerald-500' },
        { label: 'Pending', value: 'PENDING', icon: Clock, color: 'text-amber-500' },
        { label: 'Rejected', value: 'REJECTED', icon: XCircle, color: 'text-red-500' },
        { label: 'Disabled', value: 'DISABLED', icon: Ban, color: 'text-zinc-500' },
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
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-zinc-500/20 text-zinc-500">DISABLED</span>;
            default:
                return null;
        }
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
                Failed to load gyms. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">All Gyms</h1>
                <p className="text-zinc-400 mt-1">
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
                Showing {gyms?.length || 0} gym{gyms?.length !== 1 ? 's' : ''}
            </div>

            {/* Gyms Table */}
            {gyms && gyms.length > 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Gym</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Owner</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Price</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {gyms.map((gym) => (
                                <tr key={gym.id} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {gym.images[0] ? (
                                                <img
                                                    src={gym.images[0]}
                                                    alt={gym.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-zinc-600" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">{gym.name}</p>
                                                <p className="text-sm text-zinc-500 line-clamp-1">{gym.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm">{gym.owner.name}</p>
                                        <p className="text-xs text-zinc-500">{gym.owner.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-[#FF6B35]">₹{gym.dayPassPrice}</span>
                                        <span className="text-zinc-500">/day</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(gym.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedGym(gym)}
                                            className="text-sm text-[#FF6B35] hover:underline"
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
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                    <Building2 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No gyms found</h3>
                    <p className="text-zinc-400">
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
