import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RejectGymDto, GetBookingsDto } from './dto/admin.dto';
import { GymStatus } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get dashboard metrics
     */
    async getDashboardMetrics() {
        const [totalGyms, approvedGyms, pendingGyms, totalBookings, revenue] = await Promise.all([
            this.prisma.gym.count(),
            this.prisma.gym.count({ where: { status: GymStatus.APPROVED } }),
            this.prisma.gym.count({ where: { status: GymStatus.PENDING } }),
            this.prisma.booking.count(),
            this.prisma.booking.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    status: {
                        in: ['CONFIRMED', 'USED'],
                    },
                },
            }),
        ]);

        return {
            totalGyms,
            approvedGyms,
            pendingGyms,
            totalBookings,
            totalRevenue: Number(revenue._sum.amount || 0),
        };
    }

    /**
     * Get pending gyms for approval
     */
    async getPendingGyms() {
        return this.prisma.gym.findMany({
            where: { status: GymStatus.PENDING },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    /**
     * Get all gyms with optional status filter
     */
    async getAllGyms(status?: GymStatus) {
        return this.prisma.gym.findMany({
            where: status ? { status } : {},
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        bookings: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Approve a gym
     */
    async approveGym(gymId: string) {
        const gym = await this.prisma.gym.findUnique({
            where: { id: gymId },
        });

        if (!gym) {
            throw new NotFoundException('Gym not found');
        }

        return this.prisma.gym.update({
            where: { id: gymId },
            data: {
                status: GymStatus.APPROVED,
                rejectReason: null,
            },
        });
    }

    /**
     * Reject a gym
     */
    async rejectGym(gymId: string, dto: RejectGymDto) {
        const gym = await this.prisma.gym.findUnique({
            where: { id: gymId },
        });

        if (!gym) {
            throw new NotFoundException('Gym not found');
        }

        return this.prisma.gym.update({
            where: { id: gymId },
            data: {
                status: GymStatus.REJECTED,
                rejectReason: dto.reason,
            },
        });
    }

    /**
     * Get all bookings with filters
     */
    async getBookings(dto: GetBookingsDto) {
        const { status, gymId, userId, userSearch, dateFrom, dateTo, page = 1, limit = 20 } = dto;

        const where: any = {};

        if (status) where.status = status;
        if (gymId) where.gymId = gymId;
        if (userId) where.userId = userId;
        if (userSearch) {
            where.user = {
                OR: [
                    { name: { contains: userSearch, mode: 'insensitive' } },
                    { email: { contains: userSearch, mode: 'insensitive' } },
                ],
            };
        }
        if (dateFrom || dateTo) {
            where.bookingDate = {};
            if (dateFrom) where.bookingDate.gte = new Date(dateFrom);
            if (dateTo) where.bookingDate.lte = new Date(dateTo);
        }

        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                include: {
                    gym: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.booking.count({ where }),
        ]);

        return {
            data: bookings,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get booking trends for last N days
     */
    async getBookingTrends(days: number = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const bookings = await this.prisma.booking.findMany({
            where: {
                createdAt: { gte: startDate },
            },
            select: {
                createdAt: true,
                amount: true,
            },
        });

        // Group by date
        const trendMap = new Map<string, { count: number; revenue: number }>();

        // Initialize all days with zero values
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            const dateKey = date.toISOString().split('T')[0];
            trendMap.set(dateKey, { count: 0, revenue: 0 });
        }

        // Fill in actual data
        bookings.forEach((booking) => {
            const dateKey = booking.createdAt.toISOString().split('T')[0];
            const existing = trendMap.get(dateKey) || { count: 0, revenue: 0 };
            trendMap.set(dateKey, {
                count: existing.count + 1,
                revenue: existing.revenue + Number(booking.amount),
            });
        });

        return Array.from(trendMap.entries()).map(([date, data]) => ({
            date,
            bookings: data.count,
            revenue: data.revenue,
        }));
    }

    /**
     * Get gym status distribution
     */
    async getGymStatusDistribution() {
        const [approved, pending, rejected, disabled] = await Promise.all([
            this.prisma.gym.count({ where: { status: GymStatus.APPROVED } }),
            this.prisma.gym.count({ where: { status: GymStatus.PENDING } }),
            this.prisma.gym.count({ where: { status: GymStatus.REJECTED } }),
            this.prisma.gym.count({ where: { status: GymStatus.DISABLED } }),
        ]);

        return [
            { name: 'Approved', value: approved, color: '#22c55e' },
            { name: 'Pending', value: pending, color: '#f59e0b' },
            { name: 'Rejected', value: rejected, color: '#ef4444' },
            { name: 'Disabled', value: disabled, color: '#6b7280' },
        ].filter(item => item.value > 0);
    }

    /**
     * Get revenue by gym (top 5)
     */
    async getRevenueByGym() {
        const gymsWithRevenue = await this.prisma.gym.findMany({
            where: { status: GymStatus.APPROVED },
            select: {
                id: true,
                name: true,
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED', 'USED'] },
                    },
                    select: {
                        amount: true,
                    },
                },
            },
        });

        const revenueData = gymsWithRevenue
            .map((gym) => ({
                name: gym.name.length > 15 ? gym.name.substring(0, 15) + '...' : gym.name,
                revenue: gym.bookings.reduce((sum, b) => sum + Number(b.amount), 0),
                bookings: gym.bookings.length,
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return revenueData;
    }

    /**
     * Get all users with booking counts
     */
    async getUsers(dto: { search?: string; page?: number; limit?: number }) {
        const { search, page = 1, limit = 20 } = dto;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    createdAt: true,
                    _count: {
                        select: { bookings: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users.map((u) => ({
                ...u,
                bookingCount: u._count.bookings,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get all gym owners with gym counts
     */
    async getGymOwners(dto: { search?: string; page?: number; limit?: number }) {
        const { search, page = 1, limit = 20 } = dto;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }

        const [owners, total] = await Promise.all([
            this.prisma.gymOwner.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    createdAt: true,
                    gyms: {
                        select: {
                            id: true,
                            name: true,
                            status: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.gymOwner.count({ where }),
        ]);

        return {
            data: owners.map((o) => ({
                ...o,
                gymCount: o.gyms.length,
                approvedGyms: o.gyms.filter((g) => g.status === 'APPROVED').length,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get list of gyms for dropdown filter
     */
    async getGymsDropdown() {
        return this.prisma.gym.findMany({
            where: { status: GymStatus.APPROVED },
            select: {
                id: true,
                name: true,
            },
            orderBy: { name: 'asc' },
        });
    }
}
