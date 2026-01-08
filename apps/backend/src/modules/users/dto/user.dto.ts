import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John Doe' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: '+919876543210' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: 25 })
    @IsInt()
    @Min(13)
    @Max(100)
    @IsOptional()
    age?: number;

    @ApiPropertyOptional({ example: 'Male' })
    @IsString()
    @IsOptional()
    gender?: string;

    @ApiPropertyOptional({ example: 'https://cloudinary.com/avatar.jpg' })
    @IsString()
    @IsOptional()
    avatar?: string;
}
