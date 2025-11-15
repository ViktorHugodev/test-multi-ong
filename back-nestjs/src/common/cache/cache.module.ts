import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';

/**
 * Global Cache Module
 *
 * Provides CacheService to all modules without explicit import
 *
 * Management Endpoints:
 * - GET /api/cache/metrics - Cache performance metrics
 * - GET /api/cache/info - Redis server information
 * - GET /api/cache/stats - Cache statistics by prefix
 * - GET /api/cache/health - Health check endpoint
 * - DELETE /api/cache/clear - Clear all cache (requires auth)
 * - DELETE /api/cache/pattern/:pattern - Clear by pattern (requires auth)
 */
@Global()
@Module({
  controllers: [CacheController],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
