import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

/**
 * Generic Cache Service using Redis
 *
 * Features:
 * - Automatic serialization/deserialization
 * - TTL support
 * - Key prefixing
 * - Metrics tracking (hit rate, latency)
 * - Pattern-based deletion
 * - Cache warming support
 */
@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
  };

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get('REDIS_PORT') || 6379,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.redis.on('connect', () => {
      this.logger.log('✅ Redis cache connected');
    });

    this.redis.on('error', (err) => {
      this.logger.error('❌ Redis cache error:', err);
      this.metrics.errors++;
    });

    this.redis.on('ready', () => {
      this.logger.log('🚀 Redis cache ready');
    });
  }

  /**
   * Get value from cache
   * Automatically deserializes JSON
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const startTime = Date.now();
    const fullKey = this.buildKey(key, options?.prefix);

    try {
      const value = await this.redis.get(fullKey);

      if (value === null) {
        this.metrics.misses++;
        this.logAccess('MISS', fullKey, Date.now() - startTime);
        return null;
      }

      this.metrics.hits++;
      this.logAccess('HIT', fullKey, Date.now() - startTime);

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${fullKey}:`, error);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Set value in cache
   * Automatically serializes to JSON
   */
  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions,
  ): Promise<boolean> {
    const startTime = Date.now();
    const fullKey = this.buildKey(key, options?.prefix);
    const ttl = options?.ttl;

    try {
      const serialized = JSON.stringify(value);

      if (ttl) {
        await this.redis.setex(fullKey, ttl, serialized);
      } else {
        await this.redis.set(fullKey, serialized);
      }

      this.metrics.sets++;
      this.logAccess('SET', fullKey, Date.now() - startTime);

      return true;
    } catch (error) {
      this.logger.error(`Cache SET error for key ${fullKey}:`, error);
      this.metrics.errors++;
      return false;
    }
  }

  /**
   * Delete specific key
   */
  async del(key: string, options?: CacheOptions): Promise<boolean> {
    const fullKey = this.buildKey(key, options?.prefix);

    try {
      const result = await this.redis.del(fullKey);
      this.metrics.deletes++;
      this.logger.debug(`Cache DEL: ${fullKey} (deleted: ${result})`);
      return result > 0;
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${fullKey}:`, error);
      this.metrics.errors++;
      return false;
    }
  }

  /**
   * Delete all keys matching pattern
   * Example: deletePattern('products:*') deletes all product cache
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);

      if (keys.length === 0) {
        this.logger.debug(`No keys found for pattern: ${pattern}`);
        return 0;
      }

      const result = await this.redis.del(...keys);
      this.metrics.deletes += result;
      this.logger.log(
        `Cache PATTERN DELETE: ${pattern} (deleted ${result} keys)`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Cache PATTERN DELETE error for ${pattern}:`, error);
      this.metrics.errors++;
      return 0;
    }
  }

  /**
   * Clear all cache (use with caution!)
   */
  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
      this.logger.warn('⚠️ All cache cleared');
    } catch (error) {
      this.logger.error('Cache CLEAR error:', error);
      this.metrics.errors++;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    const fullKey = this.buildKey(key, options?.prefix);

    try {
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache EXISTS error for key ${fullKey}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string, options?: CacheOptions): Promise<number> {
    const fullKey = this.buildKey(key, options?.prefix);

    try {
      return await this.redis.ttl(fullKey);
    } catch (error) {
      this.logger.error(`Cache TTL error for key ${fullKey}:`, error);
      return -1;
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics & { hitRate: string; totalRequests: number } {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate =
      totalRequests > 0
        ? ((this.metrics.hits / totalRequests) * 100).toFixed(2)
        : '0.00';

    return {
      ...this.metrics,
      hitRate: `${hitRate}%`,
      totalRequests,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };
    this.logger.log('Cache metrics reset');
  }

  /**
   * Get cache info (memory usage, keys count, etc.)
   */
  async getInfo(): Promise<any> {
    try {
      const info = await this.redis.info('memory');
      const dbSize = await this.redis.dbsize();

      // Parse memory info
      const usedMemory = info.match(/used_memory_human:(.*)/)?.[1]?.trim();
      const maxMemory = info.match(/maxmemory_human:(.*)/)?.[1]?.trim();

      return {
        dbSize,
        usedMemory,
        maxMemory,
        ...this.getMetrics(),
      };
    } catch (error) {
      this.logger.error('Cache INFO error:', error);
      return null;
    }
  }

  /**
   * Build full cache key with optional prefix
   */
  private buildKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  /**
   * Log cache access for debugging
   */
  private logAccess(operation: string, key: string, latency: number): void {
    if (process.env.LOG_CACHE_ACCESS === 'true') {
      this.logger.debug(`[${operation}] ${key} (${latency}ms)`);
    }
  }

  /**
   * Get raw Redis client (for advanced operations)
   */
  getClient(): Redis {
    return this.redis;
  }

  /**
   * Get detailed Redis server information
   */
  async getRedisInfo(): Promise<Record<string, string>> {
    try {
      const [serverInfo, memoryInfo, statsInfo] = await Promise.all([
        this.redis.info('server'),
        this.redis.info('memory'),
        this.redis.info('stats'),
      ]);

      const parseInfo = (infoString: string): Record<string, string> => {
        const result: Record<string, string> = {};
        infoString.split('\r\n').forEach((line) => {
          if (line && !line.startsWith('#')) {
            const [key, value] = line.split(':');
            if (key && value) {
              result[key.trim()] = value.trim();
            }
          }
        });
        return result;
      };

      const server = parseInfo(serverInfo);
      const memory = parseInfo(memoryInfo);
      const stats = parseInfo(statsInfo);

      return {
        redis_version: server.redis_version || 'unknown',
        uptime_in_days: server.uptime_in_days || '0',
        connected_clients: stats.connected_clients || '0',
        used_memory_human: memory.used_memory_human || '0',
        maxmemory_human: memory.maxmemory_human || 'unlimited',
        total_commands_processed: stats.total_commands_processed || '0',
        instantaneous_ops_per_sec: stats.instantaneous_ops_per_sec || '0',
      };
    } catch (error) {
      this.logger.error('Failed to get Redis info:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics grouped by prefix
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    keysByPrefix: Record<string, number>;
  }> {
    try {
      const allKeys = await this.redis.keys('*');
      const keysByPrefix: Record<string, number> = {};

      allKeys.forEach((key) => {
        const prefix = key.split(':')[0];
        keysByPrefix[prefix] = (keysByPrefix[prefix] || 0) + 1;
      });

      return {
        totalKeys: allKeys.length,
        keysByPrefix,
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      throw error;
    }
  }

  /**
   * Flush all cache (alias for clear)
   */
  async flushAll(): Promise<void> {
    return this.clear();
  }
}
