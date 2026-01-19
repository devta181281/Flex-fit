'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, Gym } from '@/lib/api';
import { GymDetailModal } from '@/components/GymDetailModal';
import { RejectModal } from '@/components/RejectModal';
import { Building2, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PendingGymsPage() {
    const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
    const [rejectingGym, setRejectingGym] = useState<Gym | null>(null);
    const queryClient = useQueryClient();

    const { data: pendingGyms, isLoading, error } = useQuery({
        queryKey: ['pendingGyms'],
        queryFn: adminApi.getPendingGyms,
    });

    const approveMutation = useMutation({
        mutationFn: adminApi.approveGym,
        onSuccess: () => {
            toast.success('Gym approved successfully!');
            queryClient.invalidateQueries({ queryKey: ['pendingGyms'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
            setSelectedGym(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to approve gym');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ gymId, reason }: { gymId: string; reason: string }) =>
            adminApi.rejectGym(gymId, reason),
        onSuccess: () => {
            toast.success('Gym rejected');
            queryClient.invalidateQueries({ queryKey: ['pendingGyms'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
            setRejectingGym(null);
            setSelectedGym(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reject gym');
        },
    });

    const handleApprove = (gymId: string) => {
        approveMutation.mutate(gymId);
    };

    const handleReject = (gymId: string) => {
        const gym = pendingGyms?.find(g => g.id === gymId);
        if (gym) {
            setRejectingGym(gym);
        }
    };

    const confirmReject = (reason: string) => {
        if (rejectingGym) {
            rejectMutation.mutate({ gymId: rejectingGym.id, reason });
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
                Failed to load pending gyms. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)]">Pending Approvals</h1>
                <p className="text-[var(--muted)] mt-1">
                    Review and approve gym submissions
                </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-amber-500">
                    {pendingGyms?.length || 0} gym{pendingGyms?.length !== 1 ? 's' : ''} waiting for review
                </span>
            </div>

            {/* Gyms Grid */}
            {pendingGyms && pendingGyms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingGyms.map((gym) => (
                        <div
                            key={gym.id}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--primary)]/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedGym(gym)}
                        >
                            {/* Image */}
                            <div className="h-40 bg-[var(--surface-hover)] relative">
                                {gym.images[0] ? (
                                    <img
                                        src={gym.images[0]}
                                        alt={gym.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Building2 className="w-12 h-12 text-[var(--muted)]" />
                                    </div>
                                )}
                                <span className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                                    PENDING
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-semibold text-lg mb-1 text-[var(--foreground)]">{gym.name}</h3>
                                <p className="text-sm text-[var(--muted)] mb-3 line-clamp-1">{gym.address}</p>

                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--primary)] font-semibold">₹{gym.dayPassPrice}/day</span>
                                    <span className="text-sm text-[var(--muted)]">by {gym.owner.name}</span>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleApprove(gym.id);
                                        }}
                                        disabled={approveMutation.isPending}
                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReject(gym.id);
                                        }}
                                        disabled={rejectMutation.isPending}
                                        className="flex-1 py-2 bg-[var(--surface-hover)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">All caught up!</h3>
                    <p className="text-[var(--muted)]">There are no pending gyms to review.</p>
                </div>
            )}

            {/* Gym Detail Modal */}
            {selectedGym && (
                <GymDetailModal
                    gym={selectedGym}
                    onClose={() => setSelectedGym(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isApproving={approveMutation.isPending}
                />
            )}

            {/* Reject Modal */}
            {rejectingGym && (
                <RejectModal
                    gymName={rejectingGym.name}
                    onClose={() => setRejectingGym(null)}
                    onConfirm={confirmReject}
                    isLoading={rejectMutation.isPending}
                />
            )}
        </div>
    );
}
