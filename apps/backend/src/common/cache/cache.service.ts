import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Cache Service Helper
 * Provides utility methods for cache operations
 */
@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async get<T>(key: string): Promise<T | undefined> {
        return this.cacheManager.get<T>(key);
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        if (ttl) {
            await this.cacheManager.set(key, value, ttl * 1000);
        } else {
            await this.cacheManager.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.cacheManager.del(key);
    }

    /**
     * Get or set pattern - fetches from cache, or executes factory and caches result
     */
    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttl?: number,
    ): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== undefined && cached !== null) {
            return cached;
        }

        const value = await factory();
        await this.set(key, value, ttl);
        return value;
    }
}
