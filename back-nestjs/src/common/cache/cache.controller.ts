import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CacheService } from './cache.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../auth/decorators/public.decorator';

/**
 * Cache Management Controller
 *
 * Provides endpoints for monitoring and managing the Redis cache.
 * Most endpoints require authentication for security.
 *
 * Endpoints:
 * - GET /api/cache/metrics - View cache hit rate and performance metrics
 * - GET /api/cache/info - Redis server information and memory usage
 * - DELETE /api/cache/clear - Clear all cache (dangerous, use with caution)
 * - DELETE /api/cache/pattern/:pattern - Clear cache by pattern
 */
@Controller('cache')
@UseGuards(JwtAuthGuard)
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Get cache metrics including hit rate, hits, misses
   *
   * @returns Cache performance metrics
   *
   * Example response:
   * {
   *   "hits": 1250,
   *   "misses": 150,
   *   "totalRequests": 1400,
   *   "hitRate": "89.29%",
   *   "avgLatency": 2.5
   * }
   */
  @Get('metrics')
  @Public() // Allow public access to metrics for monitoring dashboards
  async getMetrics() {
    const metrics = this.cacheService.getMetrics();

    return {
      statusCode: HttpStatus.OK,
      message: 'Cache metrics retrieved successfully',
      data: metrics,
    };
  }

  /**
   * Get Redis server information
   *
   * @returns Redis server stats including memory usage, connected clients, uptime
   *
   * Example response:
   * {
   *   "redis_version": "7.0.5",
   *   "used_memory_human": "2.45M",
   *   "connected_clients": "5",
   *   "uptime_in_days": "15",
   *   "total_commands_processed": "125430"
   * }
   */
  @Get('info')
  async getInfo() {
    const info = await this.cacheService.getRedisInfo();

    return {
      statusCode: HttpStatus.OK,
      message: 'Redis information retrieved successfully',
      data: info,
    };
  }

  /**
   * Get cache statistics including key counts by prefix
   *
   * @returns Breakdown of cache keys by prefix
   *
   * Example response:
   * {
   *   "totalKeys": 350,
   *   "keysByPrefix": {
   *     "product": 120,
   *     "product:listing": 80,
   *     "product:public": 150
   *   }
   * }
   */
  @Get('stats')
  async getStats() {
    const stats = await this.cacheService.getCacheStats();

    return {
      statusCode: HttpStatus.OK,
      message: 'Cache statistics retrieved successfully',
      data: stats,
    };
  }

  /**
   * Clear ALL cache entries
   *
   * ⚠️ WARNING: This is a destructive operation. Use with caution.
   * Only use this endpoint in development or when absolutely necessary.
   *
   * Use cases:
   * - After major data migrations
   * - When cache corruption is suspected
   * - During maintenance windows
   *
   * @returns Success confirmation
   */
  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  async clearAll() {
    await this.cacheService.flushAll();

    return {
      statusCode: HttpStatus.OK,
      message: 'All cache entries cleared successfully',
      warning:
        'This operation cleared ALL cache entries. Performance may be degraded until cache is repopulated.',
    };
  }

  /**
   * Clear cache entries by pattern
   *
   * Examples:
   * - DELETE /api/cache/pattern/product:* - Clear all product cache
   * - DELETE /api/cache/pattern/product:listing:* - Clear all product listings
   * - DELETE /api/cache/pattern/product:123e4567-* - Clear specific product and related data
   *
   * @param pattern - Redis key pattern (supports wildcards: *, ?, [])
   * @returns Number of keys deleted
   */
  @Delete('pattern/:pattern')
  @HttpCode(HttpStatus.OK)
  async clearByPattern(@Param('pattern') pattern: string) {
    const deletedCount = await this.cacheService.deletePattern(pattern);

    return {
      statusCode: HttpStatus.OK,
      message: `Cache entries matching pattern '${pattern}' cleared successfully`,
      data: {
        pattern,
        deletedCount,
      },
    };
  }

  /**
   * Get cache health status
   *
   * Performs health check on Redis connection and returns status.
   * Useful for monitoring systems and health check endpoints.
   *
   * @returns Health status and response time
   */
  @Get('health')
  @Public() // Allow public access for health checks
  async getHealth() {
    const startTime = Date.now();

    try {
      // Test Redis connection with a simple operation
      const testKey = 'health:check';
      await this.cacheService.set(testKey, { timestamp: Date.now() }, {
        ttl: 10,
      });
      const result = await this.cacheService.get(testKey);

      const latency = Date.now() - startTime;

      if (!result) {
        throw new Error('Health check write/read failed');
      }

      await this.cacheService.del(testKey);

      return {
        statusCode: HttpStatus.OK,
        message: 'Cache is healthy',
        data: {
          status: 'healthy',
          latency: `${latency}ms`,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Cache is unhealthy',
        data: {
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}
