import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendOTPDto, VerifyOTPDto, AdminLoginDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('send-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send OTP to email' })
    @ApiResponse({ status: 200, description: 'OTP sent successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async sendOTP(@Body() dto: SendOTPDto) {
        return this.authService.sendOTP(dto);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify OTP and get access token' })
    @ApiResponse({ status: 200, description: 'Authentication successful' })
    @ApiResponse({ status: 401, description: 'Invalid OTP' })
    async verifyOTP(@Body() dto: VerifyOTPDto) {
        return this.authService.verifyOTP(dto);
    }

    @Post('admin/login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin login with email and password' })
    @ApiResponse({ status: 200, description: 'Admin login successful' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async adminLogin(@Body() dto: AdminLoginDto) {
        return this.authService.adminLogin(dto);
    }
}
