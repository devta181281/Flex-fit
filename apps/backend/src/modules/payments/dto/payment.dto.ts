import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentOrderDto {
    @ApiProperty({ example: 'gym-uuid-here' })
    @IsString()
    @IsNotEmpty()
    gymId: string;

    @ApiProperty({ example: '2024-01-15' })
    @IsDateString()
    @IsNotEmpty()
    bookingDate: string;
}

export class VerifyPaymentDto {
    @ApiProperty({ example: 'order_ABC123' })
    @IsString()
    @IsNotEmpty()
    razorpayOrderId: string;

    @ApiProperty({ example: 'pay_XYZ789' })
    @IsString()
    @IsNotEmpty()
    razorpayPaymentId: string;

    @ApiProperty({ example: 'signature-hash' })
    @IsString()
    @IsNotEmpty()
    razorpaySignature: string;

    @ApiProperty({ example: 299 })
    @IsNumber()
    amount: number;
}
