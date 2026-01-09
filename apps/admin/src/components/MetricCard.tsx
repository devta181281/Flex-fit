import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'default' | 'primary' | 'success' | 'warning';
}

export function MetricCard({ title, value, icon: Icon, trend, color = 'default' }: MetricCardProps) {
    const colorStyles = {
        default: 'bg-zinc-800',
        primary: 'bg-[#FF6B35]/10 border-[#FF6B35]/20',
        success: 'bg-emerald-500/10 border-emerald-500/20',
        warning: 'bg-amber-500/10 border-amber-500/20',
    };

    const iconColors = {
        default: 'text-zinc-400',
        primary: 'text-[#FF6B35]',
        success: 'text-emerald-500',
        warning: 'text-amber-500',
    };

    return (
        <div className={`${colorStyles[color]} border border-zinc-800 rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-zinc-400">{title}</span>
                <Icon className={`w-5 h-5 ${iconColors[color]}`} />
            </div>
            <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{value}</span>
                {trend && (
                    <span className={`text-sm ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
        </div>
    );
}
