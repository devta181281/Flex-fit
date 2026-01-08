import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GymsModule } from './modules/gyms/gyms.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthController } from './health.controller';

@Module({
    imports: [
        // Global config module
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../../.env',
        }),
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
})
export class AppModule { }
