'use client';

import { useState } from 'react';
import { Gym } from '@/lib/api';
import { X, MapPin, Clock, CheckCircle2, XCircle, Building2 } from 'lucide-react';

interface GymDetailModalProps {
    gym: Gym;
    onClose: () => void;
    onApprove: (gymId: string) => void;
    onReject: (gymId: string) => void;
    isApproving?: boolean;
}

export function GymDetailModal({ gym, onClose, onApprove, onReject, isApproving }: GymDetailModalProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const formatOpeningHours = (hours: Record<string, string>) => {
        const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        const dayNames: Record<string, string> = {
            mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
            thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
        };

        return days.map(day => ({
            day: dayNames[day],
            hours: hours[day] || 'Closed'
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="overflow-y-auto max-h-[90vh]">
                    {/* Image Gallery */}
                    <div className="relative h-64 md:h-80 bg-[var(--surface-hover)]">
                        {gym.images.length > 0 ? (
                            <>
                                <img
                                    src={gym.images[activeImageIndex]}
                                    alt={gym.name}
                                    className="w-full h-full object-cover"
                                />
                                {gym.images.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {gym.images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setActiveImageIndex(index)}
                                                className={`w-2 h-2 rounded-full transition-colors ${index === activeImageIndex
                                                    ? 'bg-white'
                                                    : 'bg-white/50 hover:bg-white/70'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-16 h-16 text-[var(--muted)]" />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-[var(--foreground)]">{gym.name}</h2>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${gym.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-500' :
                                    gym.status === 'PENDING' ? 'bg-amber-500/20 text-amber-500' :
                                        gym.status === 'REJECTED' ? 'bg-red-500/20 text-red-500' :
                                            'bg-[var(--muted)]/20 text-[var(--muted)]'
                                    }`}>
                                    {gym.status}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-[var(--primary)]">₹{gym.dayPassPrice}/day</p>
                        </div>

                        {/* Address */}
                        <div className="flex items-start gap-3 text-[var(--muted)]">
                            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <p>{gym.address}</p>
                        </div>

                        {/* Description */}
                        {gym.description && (
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--muted)] mb-2">Description</h3>
                                <p className="text-[var(--text-secondary)]">{gym.description}</p>
                            </div>
                        )}

                        {/* Amenities */}
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--muted)] mb-3">Amenities</h3>
                            <div className="flex flex-wrap gap-2">
                                {gym.amenities.map((amenity) => (
                                    <span
                                        key={amenity}
                                        className="px-3 py-1.5 bg-[var(--surface-hover)] text-[var(--foreground)] rounded-full text-sm"
                                    >
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Opening Hours */}
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--muted)] mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Opening Hours
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {formatOpeningHours(gym.openingHours).map(({ day, hours }) => (
                                    <div key={day} className="bg-[var(--surface-hover)] rounded-lg p-3">
                                        <p className="text-xs text-[var(--muted)]">{day}</p>
                                        <p className="text-sm font-medium text-[var(--foreground)]">{hours}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rules */}
                        {gym.rules && (
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--muted)] mb-2">Rules</h3>
                                <p className="text-[var(--text-secondary)] text-sm">{gym.rules}</p>
                            </div>
                        )}

                        {/* Owner Info */}
                        <div className="bg-[var(--surface-hover)] rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-[var(--muted)] mb-3">Owner Information</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-lg font-semibold text-white">
                                    {gym.owner.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--foreground)]">{gym.owner.name}</p>
                                    <p className="text-sm text-[var(--muted)]">{gym.owner.email}</p>
                                    {gym.owner.phone && (
                                        <p className="text-sm text-[var(--muted)]">{gym.owner.phone}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions for Pending Gyms */}
                        {gym.status === 'PENDING' && (
                            <div className="flex gap-4 pt-4 border-t border-[var(--border)]">
                                <button
                                    onClick={() => onApprove(gym.id)}
                                    disabled={isApproving}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Approve Gym
                                </button>
                                <button
                                    onClick={() => onReject(gym.id)}
                                    disabled={isApproving}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Reject
                                </button>
                            </div>
                        )}

                        {/* Rejection reason */}
                        {gym.status === 'REJECTED' && gym.rejectReason && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-red-500 mb-2">Rejection Reason</h3>
                                <p className="text-[var(--text-secondary)]">{gym.rejectReason}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
