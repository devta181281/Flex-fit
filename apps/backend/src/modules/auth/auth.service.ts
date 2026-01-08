import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from './supabase.service';
import { SendOTPDto, VerifyOTPDto, AdminLoginDto } from './dto/auth.dto';

export enum UserRole {
    USER = 'USER',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
}

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private supabaseService: SupabaseService,
    ) { }

    /**
     * Send OTP to email
     */
    async sendOTP(dto: SendOTPDto) {
        const result = await this.supabaseService.sendOTP(dto.email);

        if (!result.success) {
            throw new BadRequestException(result.error || 'Failed to send OTP');
        }

        return { message: 'OTP sent successfully to your email' };
    }

    /**
     * Verify OTP and create/login user
     */
    async verifyOTP(dto: VerifyOTPDto) {
        const result = await this.supabaseService.verifyOTP(dto.email, dto.otp);

        if (!result.success || !result.userId) {
            throw new UnauthorizedException(result.error || 'Invalid OTP');
        }

        let user;
        let role = dto.role;

        if (role === UserRole.USER) {
            // Find or create user
            user = await this.prisma.user.upsert({
                where: { email: dto.email },
                update: { supabaseUid: result.userId },
                create: {
                    email: dto.email,
                    supabaseUid: result.userId,
                },
            });
        } else if (role === UserRole.OWNER) {
            // Find or create gym owner
            user = await this.prisma.gymOwner.upsert({
                where: { email: dto.email },
                update: { supabaseUid: result.userId },
                create: {
                    email: dto.email,
                    name: dto.email.split('@')[0], // Temporary name from email
                    supabaseUid: result.userId,
                },
            });
        } else {
            throw new BadRequestException('Invalid role for OTP login');
        }

        // Generate JWT token
        const payload = {
            sub: user.id,
            email: user.email,
            role,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            user,
            accessToken,
            role,
        };
    }

    /**
     * Admin login with email and password
     */
    async adminLogin(dto: AdminLoginDto) {
        const admin = await this.prisma.admin.findUnique({
            where: { email: dto.email },
        });

        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, admin.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: admin.id,
            email: admin.email,
            role: UserRole.ADMIN,
        };

        const accessToken = this.jwtService.sign(payload);

        // Remove password from response
        const { password: _, ...adminData } = admin;

        return {
            user: adminData,
            accessToken,
            role: UserRole.ADMIN,
        };
    }

    /**
     * Validate JWT payload and get user
     */
    async validateUser(payload: { sub: string; role: UserRole }) {
        if (payload.role === UserRole.USER) {
            return this.prisma.user.findUnique({ where: { id: payload.sub } });
        } else if (payload.role === UserRole.OWNER) {
            return this.prisma.gymOwner.findUnique({ where: { id: payload.sub } });
        } else if (payload.role === UserRole.ADMIN) {
            const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
            if (admin) {
                const { password: _, ...adminData } = admin;
                return adminData;
            }
        }
        return null;
    }
}
