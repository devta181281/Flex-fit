import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
        });
    }

    async onModuleInit() {
        let retries = 3;
        while (retries > 0) {
            try {
                await this.$connect();
                this.logger.log('✅ Database connected successfully');
                return;
            } catch (error) {
                retries--;
                this.logger.warn(`Database connection failed, retrying... (${retries} attempts left)`);
                if (retries === 0) {
                    this.logger.error('Failed to connect to database after 3 attempts');
                    throw error;
                }
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('🔌 Database disconnected');
    }

    // Helper for cleaning database in tests
    async cleanDatabase() {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('cleanDatabase can only be called in test environment');
        }

        const tablenames = await this.$queryRaw<
            Array<{ tablename: string }>
        >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

        for (const { tablename } of tablenames) {
            if (tablename !== '_prisma_migrations') {
                try {
                    await this.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
                } catch (error) {
                    console.log(`Error truncating ${tablename}:`, error);
                }
            }
        }
    }
}
