import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto, ValidateQRDto } from './dto/booking.dto';
import { BookingStatus } from '@prisma/client';
import * as QRCode from 'qrcode';

@Injectable()
export class BookingsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create a new booking after successful payment
     */
    async create(userId: string, dto: CreateBookingDto) {
        // Verify gym exists
        const gym = await this.prisma.gym.findUnique({
            where: { id: dto.gymId },
        });

        if (!gym) {
            throw new NotFoundException('Gym not found');
        }

        if (gym.status !== 'APPROVED') {
            throw new BadRequestException('Gym is not available for booking');
        }

        // Generate unique booking code
        const bookingCode = this.generateBookingCode();

        // Generate QR code
        const qrCode = await this.generateQRCode(bookingCode);

        // Create booking
        const booking = await this.prisma.booking.create({
            data: {
                bookingCode,
                userId,
                gymId: dto.gymId,
                bookingDate: new Date(dto.bookingDate),
                amount: gym.dayPassPrice,
                qrCode,
                status: BookingStatus.CONFIRMED,
            },
            include: {
                gym: true,
            },
        });

        return booking;
    }

    /**
     * Get booking by ID
     */
    async findById(id: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                gym: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    /**
     * Get user's bookings
     */
    async findByUser(userId: string) {
        return this.prisma.booking.findMany({
            where: { userId },
            include: {
                gym: true,
            },
            orderBy: { bookingDate: 'desc' },
        });
    }

    /**
     * Validate QR code and mark booking as used (For gym owner)
     */
    async validateQR(gymId: string, ownerId: string, dto: ValidateQRDto) {
        // Verify gym ownership
        const gym = await this.prisma.gym.findUnique({
            where: { id: gymId },
        });

        if (!gym) {
            throw new NotFoundException('Gym not found');
        }

        if (gym.ownerId !== ownerId) {
            throw new ForbiddenException('You can only validate QR codes for your own gyms');
        }

        // Find booking by code
        const booking = await this.prisma.booking.findUnique({
            where: { bookingCode: dto.bookingCode },
            include: {
                gym: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!booking) {
            return {
                valid: false,
                message: 'Invalid booking code',
            };
        }

        // Check if booking is for this gym
        if (booking.gymId !== gymId) {
            return {
                valid: false,
                message: 'This booking is not for your gym',
            };
        }

        // Check booking status
        if (booking.status === BookingStatus.USED) {
            return {
                valid: false,
                message: 'This booking has already been used',
                booking,
            };
        }

        if (booking.status === BookingStatus.EXPIRED) {
            return {
                valid: false,
                message: 'This booking has expired',
                booking,
            };
        }

        if (booking.status === BookingStatus.CANCELLED) {
            return {
                valid: false,
                message: 'This booking was cancelled',
                booking,
            };
        }

        // Check if booking date is today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(booking.bookingDate);
        bookingDate.setHours(0, 0, 0, 0);

        if (bookingDate.getTime() !== today.getTime()) {
            return {
                valid: false,
                message: `This booking is for ${bookingDate.toLocaleDateString()}, not today`,
                booking,
            };
        }

        // Mark as used
        const updatedBooking = await this.prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: BookingStatus.USED,
                usedAt: new Date(),
            },
            include: {
                gym: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        return {
            valid: true,
            message: 'Check-in successful!',
            booking: updatedBooking,
        };
    }

    /**
     * Generate unique booking code
     */
    private generateBookingCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'FLX-';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Generate QR code as base64 string
     */
    private async generateQRCode(bookingCode: string): Promise<string> {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(bookingCode, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            return qrCodeDataUrl;
        } catch (error) {
            console.error('QR Code generation failed:', error);
            return bookingCode; // Fallback to just the code
        }
    }

    /**
     * Mark expired bookings (cron job helper)
     */
    async markExpiredBookings() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(23, 59, 59, 999);

        await this.prisma.booking.updateMany({
            where: {
                status: BookingStatus.CONFIRMED,
                bookingDate: {
                    lt: yesterday,
                },
            },
            data: {
                status: BookingStatus.EXPIRED,
            },
        });
    }
}
