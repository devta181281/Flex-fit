import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { RejectGymDto, GetBookingsDto } from './dto/admin.dto';
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

    @Get('gyms/pending')
    @ApiOperation({ summary: 'Get pending gyms for approval' })
    async getPendingGyms() {
        return this.adminService.getPendingGyms();
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

    @Get('bookings')
    @ApiOperation({ summary: 'Get all bookings with filters' })
    async getBookings(@Query() dto: GetBookingsDto) {
        return this.adminService.getBookings(dto);
    }
}
