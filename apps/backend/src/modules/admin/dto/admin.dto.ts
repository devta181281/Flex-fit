import { IsString, IsOptional, IsEnum, IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BookingStatus } from '@prisma/client';

export class RejectGymDto {
    @ApiProperty({ example: 'Images are not clear. Please upload better quality photos.' })
    @IsString()
    reason: string;
}

export class GetBookingsDto {
    @ApiPropertyOptional({ enum: BookingStatus })
    @IsEnum(BookingStatus)
    @IsOptional()
    status?: BookingStatus;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    gymId?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    userId?: string;

    @ApiPropertyOptional({ example: '2024-01-01' })
    @IsDateString()
    @IsOptional()
    dateFrom?: string;

    @ApiPropertyOptional({ example: '2024-12-31' })
    @IsDateString()
    @IsOptional()
    dateTo?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ default: 20 })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    limit?: number;
}
