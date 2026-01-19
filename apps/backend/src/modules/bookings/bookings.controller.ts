import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, ValidateQRDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Post()
    @Roles('USER')
    @ApiOperation({ summary: 'Create a new booking' })
    async create(@Req() req: any, @Body() dto: CreateBookingDto) {
        return this.bookingsService.create(req.user.id, dto);
    }

    @Get('my')
    @Roles('USER')
    @ApiOperation({ summary: 'Get current user bookings' })
    async getMyBookings(@Req() req: any) {
        return this.bookingsService.findByUser(req.user.id);
    }

    @Get(':id')
    @Roles('USER', 'OWNER')
    @ApiOperation({ summary: 'Get booking by ID' })
    async findById(@Param('id') id: string) {
        return this.bookingsService.findById(id);
    }

    @Post('gym/:gymId/validate-qr')
    @Roles('OWNER')
    @ApiOperation({ summary: 'Validate QR code for check-in' })
    async validateQR(@Param('gymId') gymId: string, @Req() req: any, @Body() dto: ValidateQRDto) {
        return this.bookingsService.validateQR(gymId, req.user.id, dto);
    }

    @Post('test-booking')
    @Roles('USER')
    @ApiOperation({ summary: '[DEV ONLY] Create test booking without payment' })
    async createTestBooking(@Req() req: any, @Body() dto: CreateBookingDto) {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Test endpoint not available in production');
        }
        return this.bookingsService.create(req.user.id, dto);
    }
}
