import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';
import { CacheableInterceptor } from './decorators/cacheable.decorator';

/**
 * Global Cache Module
 *
 * Provides CacheService to all modules without explicit import
 *
 * Features:
 * - Redis-based distributed caching
 * - Automatic cache invalidation
 * - Persistent metrics (hit/miss ratio)
 * - @Cacheable() decorator for automatic caching
 * - Cache warming support
 *
 * Management Endpoints:
 * - GET /api/cache/metrics - Cache performance metrics (in-memory + persistent)
 * - GET /api/cache/metrics/persistent - Persistent metrics only
 * - GET /api/cache/info - Redis server information
 * - GET /api/cache/stats - Cache statistics by prefix
 * - GET /api/cache/health - Health check endpoint
 * - DELETE /api/cache/clear - Clear all cache (requires auth)
 * - DELETE /api/cache/pattern/:pattern - Clear by pattern (requires auth)
 * - DELETE /api/cache/metrics/reset - Reset persistent metrics
 *
 * Usage:
 * - Import CacheModule globally (already done)
 * - Inject CacheService in any module
 * - Use @Cacheable() decorator on controller methods
 * - Use CacheLoggingInterceptor for structured logging
 */
@Global()
@Module({
  controllers: [CacheController],
  providers: [CacheService, CacheableInterceptor],
  exports: [CacheService, CacheableInterceptor],
})
export class CacheModule {}
