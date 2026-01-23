import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GymsModule } from './modules/gyms/gyms.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthController } from './health.controller';
import { AppCacheModule, RATE_LIMIT } from './common';

@Module({
    imports: [
        // Global config module
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../../.env',
        }),
        // Rate limiting - protects against abuse
        ThrottlerModule.forRoot([{
            ttl: RATE_LIMIT.DEFAULT_TTL * 1000,
            limit: RATE_LIMIT.DEFAULT_LIMIT,
        }]),
        // Caching layer
        AppCacheModule,
        // Database
        PrismaModule,
        // Feature modules
        AuthModule,
        UsersModule,
        GymsModule,
        BookingsModule,
        PaymentsModule,
        AdminModule,
    ],
    controllers: [HealthController],
    providers: [
        // Global rate limiting guard
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }


