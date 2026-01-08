import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GymsService } from './gyms.service';
import { CreateGymDto, UpdateGymDto, GetGymsDto } from './dto/gym.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Gyms')
@Controller('gyms')
export class GymsController {
    constructor(private readonly gymsService: GymsService) { }

    @Get()
    @ApiOperation({ summary: 'Get nearby approved gyms' })
    async findNearby(@Query() dto: GetGymsDto) {
        return this.gymsService.findNearby(dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get gym by ID' })
    async findById(@Param('id') id: string) {
        return this.gymsService.findById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('OWNER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Register a new gym (Owner)' })
    async create(@Req() req: any, @Body() dto: CreateGymDto) {
        return this.gymsService.create(req.user.id, dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('OWNER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update gym details (Owner)' })
    async update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateGymDto) {
        return this.gymsService.update(id, req.user.id, dto);
    }

    @Get('owner/my-gyms')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('OWNER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get gyms owned by current owner' })
    async getMyGyms(@Req() req: any) {
        return this.gymsService.findByOwner(req.user.id);
    }

    @Get(':id/bookings')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('OWNER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get bookings for a gym (Owner)' })
    async getGymBookings(@Param('id') id: string, @Req() req: any) {
        return this.gymsService.getGymBookings(id, req.user.id);
    }
}
