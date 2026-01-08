import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
    @ApiProperty({ example: 'gym-uuid-here' })
    @IsString()
    @IsNotEmpty()
    gymId: string;

    @ApiProperty({ example: '2024-01-15' })
    @IsDateString()
    @IsNotEmpty()
    bookingDate: string;
}

export class ValidateQRDto {
    @ApiProperty({ example: 'FLX-ABC123' })
    @IsString()
    @IsNotEmpty()
    bookingCode: string;
}
