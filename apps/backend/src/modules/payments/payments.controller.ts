import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('create-order')
    @Roles('USER')
    @ApiOperation({ summary: 'Create Razorpay payment order' })
    async createOrder(@Req() req: any, @Body() dto: CreatePaymentOrderDto) {
        return this.paymentsService.createOrder(req.user.id, dto);
    }

    @Post('verify')
    @Roles('USER')
    @ApiOperation({ summary: 'Verify payment signature' })
    async verifyPayment(@Body() dto: VerifyPaymentDto) {
        return this.paymentsService.verifyPayment(dto);
    }
}
