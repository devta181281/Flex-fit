import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { RejectGymDto, GetBookingsDto, GetUsersDto, GetGymOwnersDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GymStatus } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get dashboard metrics' })
    async getDashboard() {
        return this.adminService.getDashboardMetrics();
    }

    // ==================== Analytics Endpoints ====================

    @Get('analytics/booking-trends')
    @ApiOperation({ summary: 'Get booking trends for last N days' })
    async getBookingTrends(@Query('days') days?: number) {
        return this.adminService.getBookingTrends(days || 7);
    }

    @Get('analytics/gym-status')
    @ApiOperation({ summary: 'Get gym status distribution for pie chart' })
    async getGymStatusDistribution() {
        return this.adminService.getGymStatusDistribution();
    }

    @Get('analytics/revenue-by-gym')
    @ApiOperation({ summary: 'Get top 5 gyms by revenue' })
    async getRevenueByGym() {
        return this.adminService.getRevenueByGym();
    }

    // ==================== Gym Endpoints ====================

    @Get('gyms/pending')
    @ApiOperation({ summary: 'Get pending gyms for approval' })
    async getPendingGyms() {
        return this.adminService.getPendingGyms();
    }

    @Get('gyms/dropdown')
    @ApiOperation({ summary: 'Get gyms list for dropdown filter' })
    async getGymsDropdown() {
        return this.adminService.getGymsDropdown();
    }

    @Get('gyms')
    @ApiOperation({ summary: 'Get all gyms with optional status filter' })
    async getAllGyms(@Query('status') status?: GymStatus) {
        return this.adminService.getAllGyms(status);
    }

    @Patch('gyms/:id/approve')
    @ApiOperation({ summary: 'Approve a gym' })
    async approveGym(@Param('id') id: string) {
        return this.adminService.approveGym(id);
    }

    @Patch('gyms/:id/reject')
    @ApiOperation({ summary: 'Reject a gym' })
    async rejectGym(@Param('id') id: string, @Body() dto: RejectGymDto) {
        return this.adminService.rejectGym(id, dto);
    }

    // ==================== Booking Endpoints ====================

    @Get('bookings')
    @ApiOperation({ summary: 'Get all bookings with filters' })
    async getBookings(@Query() dto: GetBookingsDto) {
        return this.adminService.getBookings(dto);
    }

    // ==================== User Management ====================

    @Get('users')
    @ApiOperation({ summary: 'Get all users with booking counts' })
    async getUsers(@Query() dto: GetUsersDto) {
        return this.adminService.getUsers(dto);
    }

    // ==================== Gym Owner Management ====================

    @Get('owners')
    @ApiOperation({ summary: 'Get all gym owners with gym counts' })
    async getGymOwners(@Query() dto: GetGymOwnersDto) {
        return this.adminService.getGymOwners(dto);
    }
}

