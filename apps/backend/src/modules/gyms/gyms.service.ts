import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGymDto, UpdateGymDto, GetGymsDto } from './dto/gym.dto';
import { GymStatus } from '@prisma/client';

@Injectable()
export class GymsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get nearby approved gyms with distance calculation
     */
    async findNearby(dto: GetGymsDto) {
        const { latitude, longitude, radiusKm = 500, minPrice, maxPrice } = dto;

        // Get all approved gyms
        const gyms = await this.prisma.gym.findMany({
            where: {
                status: GymStatus.APPROVED,
                ...(minPrice !== undefined || maxPrice !== undefined
                    ? {
                        dayPassPrice: {
                            ...(minPrice !== undefined ? { gte: minPrice } : {}),
                            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
                        },
                    }
                    : {}),
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Calculate distance and filter by radius
        const gymsWithDistance = gyms
            .map((gym) => ({
                ...gym,
                distance: this.calculateDistance(latitude, longitude, gym.latitude, gym.longitude),
            }))
            .filter((gym) => gym.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);

        return gymsWithDistance;
    }

    /**
     * Get gym by ID
     */
    async findById(id: string) {
        const gym = await this.prisma.gym.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!gym) {
            throw new NotFoundException('Gym not found');
        }

        return gym;
    }

    /**
     * Create a new gym (Gym Owner)
     */
    async create(ownerId: string, dto: CreateGymDto) {
        return this.prisma.gym.create({
            data: {
                ...dto,
                ownerId,
                status: GymStatus.PENDING,
            },
        });
    }

    /**
     * Update gym details (Gym Owner)
     */
    async update(gymId: string, ownerId: string, dto: UpdateGymDto) {
        const gym = await this.prisma.gym.findUnique({
            where: { id: gymId },
        });

        if (!gym) {
            throw new NotFoundException('Gym not found');
        }

        if (gym.ownerId !== ownerId) {
            throw new ForbiddenException('You can only update your own gyms');
        }

        return this.prisma.gym.update({
            where: { id: gymId },
            data: dto,
        });
    }

    /**
     * Get gyms owned by a specific owner
     */
    async findByOwner(ownerId: string) {
        return this.prisma.gym.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get bookings for a gym (Owner)
     */
    async getGymBookings(gymId: string, ownerId: string) {
        const gym = await this.prisma.gym.findUnique({
            where: { id: gymId },
        });

        if (!gym) {
            throw new NotFoundException('Gym not found');
        }

        if (gym.ownerId !== ownerId) {
            throw new ForbiddenException('You can only view bookings for your own gyms');
        }

        return this.prisma.booking.findMany({
            where: { gymId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: { bookingDate: 'desc' },
        });
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
            Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10; // Round to 1 decimal place
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
