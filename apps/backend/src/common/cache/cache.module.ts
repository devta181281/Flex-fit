import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CACHE_TTL } from '../constants';
import { CacheService } from './cache.service';

/**
 * Global Cache Module
 * Uses in-memory caching by default
 * Can be upgraded to Redis in production by changing the store
 */
@Global()
@Module({
    imports: [
        CacheModule.register({
            ttl: CACHE_TTL.MEDIUM * 1000,
            max: 100,
            isGlobal: true,
        }),
    ],
    providers: [CacheService],
    exports: [CacheModule, CacheService],
})
export class AppCacheModule { }
