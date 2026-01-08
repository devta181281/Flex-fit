import {
    IsString,
    IsNumber,
    IsArray,
    IsOptional,
    IsObject,
    Min,
    Max,
    IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetGymsDto {
    @ApiProperty({ example: 19.076 })
    @IsNumber()
    @Type(() => Number)
    latitude: number;

    @ApiProperty({ example: 72.8777 })
    @IsNumber()
    @Type(() => Number)
    longitude: number;

    @ApiPropertyOptional({ example: 10, default: 10 })
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(50)
    @Type(() => Number)
    radiusKm?: number;

    @ApiPropertyOptional({ example: 100 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    minPrice?: number;

    @ApiPropertyOptional({ example: 500 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    maxPrice?: number;
}

export class CreateGymDto {
    @ApiProperty({ example: 'PowerFit Gym' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'A premium fitness center with state-of-the-art equipment' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: '123 Fitness Street, Mumbai, Maharashtra' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ example: 19.076 })
    @IsNumber()
    latitude: number;

    @ApiProperty({ example: 72.8777 })
    @IsNumber()
    longitude: number;

    @ApiProperty({ example: 299 })
    @IsNumber()
    @Min(0)
    dayPassPrice: number;

    @ApiProperty({ example: ['Cardio', 'Weights', 'Parking', 'Shower', 'Locker'] })
    @IsArray()
    @IsString({ each: true })
    amenities: string[];

    @ApiProperty({ example: ['https://cloudinary.com/gym1.jpg', 'https://cloudinary.com/gym2.jpg'] })
    @IsArray()
    @IsString({ each: true })
    images: string[];

    @ApiProperty({
        example: {
            mon: '6:00-22:00',
            tue: '6:00-22:00',
            wed: '6:00-22:00',
            thu: '6:00-22:00',
            fri: '6:00-22:00',
            sat: '8:00-20:00',
            sun: '8:00-18:00',
        },
    })
    @IsObject()
    openingHours: Record<string, string>;

    @ApiPropertyOptional({ example: 'Please wear proper gym attire and carry a towel' })
    @IsString()
    @IsOptional()
    rules?: string;
}

export class UpdateGymDto {
    @ApiPropertyOptional({ example: 'PowerFit Gym Premium' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @Min(0)
    @IsOptional()
    dayPassPrice?: number;

    @ApiPropertyOptional()
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    amenities?: string[];

    @ApiPropertyOptional()
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    openingHours?: Record<string, string>;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    rules?: string;
}
