'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from 'recharts';
import { BookingTrend, GymStatusData, RevenueByGym } from '@/lib/api';

interface BookingTrendChartProps {
    data: BookingTrend[];
}

export function BookingTrendChart({ data }: BookingTrendChartProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Booking Trends (Last 7 Days)
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="var(--muted)"
                            fontSize={12}
                        />
                        <YAxis stroke="var(--muted)" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                            }}
                            labelFormatter={(label) => formatDate(String(label))}
                            formatter={(value) => [value ?? 0, 'Bookings']}
                        />
                        <Area
                            type="monotone"
                            dataKey="bookings"
                            stroke="var(--primary)"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#bookingGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

interface GymStatusChartProps {
    data: GymStatusData[];
}

export function GymStatusChart({ data }: GymStatusChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Gym Status Distribution
            </h3>
            <div className="h-64 flex items-center">
                <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                            }}
                            formatter={(value, name) => {
                                const numValue = Number(value) || 0;
                                return [`${numValue} (${((numValue / total) * 100).toFixed(1)}%)`, name];
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <div className="flex-1">
                                <div className="text-sm text-[var(--foreground)]">{item.name}</div>
                                <div className="text-xs text-[var(--muted)]">{item.value} gyms</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

interface RevenueByGymChartProps {
    data: RevenueByGym[];
}

export function RevenueByGymChart({ data }: RevenueByGymChartProps) {
    const formatCurrency = (value: number) => {
        if (value >= 1000) {
            return `₹${(value / 1000).toFixed(1)}k`;
        }
        return `₹${value}`;
    };

    return (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Top 5 Gyms by Revenue
            </h3>
            <div className="h-64">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[var(--muted)]">
                        No revenue data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis type="number" tickFormatter={formatCurrency} stroke="var(--muted)" fontSize={12} />
                            <YAxis type="category" dataKey="name" stroke="var(--muted)" fontSize={11} width={100} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                }}
                                formatter={(value) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, 'Revenue']}
                            />
                            <Bar dataKey="revenue" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
