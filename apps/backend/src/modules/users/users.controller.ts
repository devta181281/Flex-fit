import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @Roles('USER')
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@Req() req: any) {
        return this.usersService.findById(req.user.id);
    }

    @Patch('me')
    @Roles('USER')
    @ApiOperation({ summary: 'Update current user profile' })
    async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto) {
        return this.usersService.updateProfile(req.user.id, dto);
    }

    @Get('me/bookings')
    @Roles('USER')
    @ApiOperation({ summary: 'Get current user bookings' })
    async getMyBookings(@Req() req: any) {
        return this.usersService.getBookings(req.user.id);
    }
}
