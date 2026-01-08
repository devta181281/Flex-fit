import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
    USER = 'USER',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
}

export class SendOTPDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ enum: UserRole, example: UserRole.USER })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}

export class VerifyOTPDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    otp: string;

    @ApiProperty({ enum: UserRole, example: UserRole.USER })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}

export class AdminLoginDto {
    @ApiProperty({ example: 'admin@flexfit.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
