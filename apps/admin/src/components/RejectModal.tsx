'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface RejectModalProps {
    gymName: string;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isLoading?: boolean;
}

export function RejectModal({ gymName, onClose, onConfirm, isLoading }: RejectModalProps) {
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reason.trim()) {
            onConfirm(reason.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--surface-hover)] transition-colors text-[var(--muted)]"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-2 text-[var(--foreground)]">Reject Gym</h2>
                <p className="text-[var(--muted)] mb-6">
                    Please provide a reason for rejecting <span className="text-[var(--foreground)]">{gymName}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                            Rejection Reason
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please specify why this gym is being rejected..."
                            rows={4}
                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors resize-none"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-3 border border-[var(--border)] text-[var(--foreground)] rounded-lg font-medium hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !reason.trim()}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                'Reject Gym'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
