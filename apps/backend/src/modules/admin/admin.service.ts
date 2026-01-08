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
        const { status, gymId, userId, dateFrom, dateTo, page = 1, limit = 20 } = dto;

        const where: any = {};

        if (status) where.status = status;
        if (gymId) where.gymId = gymId;
        if (userId) where.userId = userId;
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
}
