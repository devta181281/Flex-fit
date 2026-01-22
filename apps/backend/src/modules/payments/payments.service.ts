import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/payment.dto';
import { PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { BookingsService } from '../bookings/bookings.service';

// Razorpay types
interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
}

// Maximum bookings allowed per user
const MAX_BOOKINGS_PER_USER = 16;

@Injectable()
export class PaymentsService {
    private razorpay: any;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        @Inject(forwardRef(() => BookingsService))
        private bookingsService: BookingsService,
    ) {
        // Initialize Razorpay
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Razorpay = require('razorpay');
        this.razorpay = new Razorpay({
            key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
            key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
        });
    }

    /**
     * Create a Razorpay order
     */
    async createOrder(userId: string, dto: CreatePaymentOrderDto) {
        // Check booking limit BEFORE anything else
        const bookingCount = await this.bookingsService.getUserBookingCount(userId);
        if (bookingCount >= MAX_BOOKINGS_PER_USER) {
            throw new BadRequestException(
                `You have reached the maximum limit of ${MAX_BOOKINGS_PER_USER} bookings`
            );
        }

        // Get gym details
        const gym = await this.prisma.gym.findUnique({
            where: { id: dto.gymId },
        });

        if (!gym) {
            throw new NotFoundException('Gym not found');
        }

        if (gym.status !== 'APPROVED') {
            throw new BadRequestException('Gym is not available for booking');
        }

        // Create Razorpay order
        const amount = Number(gym.dayPassPrice) * 100; // Convert to paise
        const receipt = `FLX_${Date.now()}_${userId.slice(0, 8)}`;

        try {
            const order: RazorpayOrder = await this.razorpay.orders.create({
                amount,
                currency: 'INR',
                receipt,
                notes: {
                    gymId: dto.gymId,
                    userId,
                    bookingDate: dto.bookingDate,
                },
            });

            return {
                orderId: order.id,
                amount: Number(gym.dayPassPrice),
                currency: 'INR',
                gymName: gym.name,
                keyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
            };
        } catch (error) {
            console.error('Razorpay order creation failed:', error);
            throw new BadRequestException('Failed to create payment order');
        }
    }

    /**
     * Verify payment signature
     */
    async verifyPayment(dto: VerifyPaymentDto) {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = dto;

        // Verify signature
        const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
        const body = razorpayOrderId + '|' + razorpayPaymentId;

        const expectedSignature = crypto
            .createHmac('sha256', keySecret!)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            throw new BadRequestException('Invalid payment signature');
        }

        // Store payment record
        const payment = await this.prisma.payment.create({
            data: {
                razorpayPaymentId,
                razorpayOrderId,
                razorpaySignature,
                amount: dto.amount,
                status: PaymentStatus.SUCCESS,
            },
        });

        return {
            success: true,
            paymentId: payment.id,
            message: 'Payment verified successfully',
        };
    }
}
