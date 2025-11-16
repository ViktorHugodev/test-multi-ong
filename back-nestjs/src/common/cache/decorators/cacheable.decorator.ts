import {
  applyDecorators,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../cache.service';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';

export interface CacheableOptions {
  ttl?: number; // Time to live in seconds (default: 300 = 5 minutes)
  keyPrefix?: string; // Custom key prefix (default: auto-generated from controller/method)
}

// Metadata keys
export const CACHEABLE_KEY = 'cache:cacheable';
export const CACHEABLE_OPTIONS_KEY = 'cache:cacheable:options';

/**
 * @Cacheable() Decorator
 *
 * Automatically caches the result of a controller method.
 * Generates cache key based on controller name, method name, and request parameters.
 *
 * Features:
 * - Automatic cache key generation
 * - Configurable TTL
 * - Multi-tenancy support (includes organizationId in key)
 * - Hit/miss metrics recording
 * - Graceful degradation (continues if cache fails)
 *
 * Usage:
 * @Cacheable({ ttl: 600, keyPrefix: 'products' })
 * async findAll(@Query() filters: FilterDto) { ... }
 */
export function Cacheable(options?: CacheableOptions): MethodDecorator {
  return applyDecorators(
    SetMetadata(CACHEABLE_KEY, true),
    SetMetadata(CACHEABLE_OPTIONS_KEY, options || {}),
    UseInterceptors(CacheableInterceptor),
  );
}

@Injectable()
export class CacheableInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheableInterceptor.name);
  private cacheService: CacheService | null = null;

  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // Lazy load CacheService to avoid circular dependency
    if (!this.cacheService) {
      try {
        this.cacheService = this.moduleRef.get(CacheService, { strict: false });
      } catch (error) {
        this.logger.warn('CacheService not available, skipping cache');
        return next.handle();
      }
    }

    // Get decorator options
    const options =
      this.reflector.get<CacheableOptions>(
        CACHEABLE_OPTIONS_KEY,
        context.getHandler(),
      ) || {};

    const ttl = options.ttl || 300; // Default 5 minutes

    // Generate cache key
    const cacheKey = this.generateCacheKey(context, options.keyPrefix);

    try {
      // Try to get from cache
      const cachedValue = await this.cacheService.get<any>(cacheKey);

      if (cachedValue !== null) {
        // Cache HIT
        await this.cacheService.recordHit();
        this.logCacheOperation('HIT', cacheKey, context);
        return of(cachedValue);
      }

      // Cache MISS
      await this.cacheService.recordMiss();
      this.logCacheOperation('MISS', cacheKey, context);

      // Execute handler and cache result
      return next.handle().pipe(
        tap(async (response) => {
          try {
            await this.cacheService!.set(cacheKey, response, { ttl });
            this.logCacheOperation('SET', cacheKey, context, ttl);
          } catch (error) {
            this.logger.error(
              `Failed to cache result for key ${cacheKey}:`,
              error,
            );
          }
        }),
      );
    } catch (error) {
      // Cache operation failed, execute handler without caching
      this.logger.error(`Cache operation failed for key ${cacheKey}:`, error);
      return next.handle();
    }
  }

  /**
   * Generate cache key based on request context
   *
   * Format: {prefix}:{controllerName}:{methodName}:{orgId}:{paramsHash}
   *
   * Examples:
   * - products:ProductsController:findAll:org123:page_1:limit_20
   * - products:ProductsController:findOne:org123:id_abc123
   */
  private generateCacheKey(
    context: ExecutionContext,
    customPrefix?: string,
  ): string {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();

    const controllerName = controller.name;
    const methodName = handler.name;

    // Get organizationId from request (multi-tenancy)
    const organizationId =
      request.user?.organizationId ||
      request.organizationId ||
      'public';

    // Build parameters hash from query and route params
    const queryParams = this.serializeParams(request.query || {});
    const routeParams = this.serializeParams(request.params || {});

    // Combine all parts
    const parts = [
      customPrefix || this.extractPrefix(controllerName),
      controllerName,
      methodName,
      organizationId,
    ];

    // Add route params (e.g., :id)
    if (routeParams) {
      parts.push(routeParams);
    }

    // Add query params (e.g., page, limit, filters)
    if (queryParams) {
      parts.push(queryParams);
    }

    return parts.join(':');
  }

  /**
   * Extract prefix from controller name
   * ProductsController -> products
   * UsersController -> users
   */
  private extractPrefix(controllerName: string): string {
    return controllerName
      .replace(/Controller$/i, '')
      .toLowerCase();
  }

  /**
   * Serialize parameters object to cache key string
   * Sorts keys for consistency
   *
   * Example:
   * { page: 1, limit: 20, category: 'electronics' }
   * -> 'category_electronics:limit_20:page_1'
   */
  private serializeParams(params: Record<string, any>): string {
    const keys = Object.keys(params).sort();

    if (keys.length === 0) {
      return '';
    }

    return keys
      .map((key) => {
        const value = params[key];
        // Handle arrays and objects
        const serializedValue =
          typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);
        return `${key}_${serializedValue}`;
      })
      .join(':');
  }

  /**
   * Log cache operation with context
   */
  private logCacheOperation(
    operation: 'HIT' | 'MISS' | 'SET',
    key: string,
    context: ExecutionContext,
    ttl?: number,
  ): void {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    const logData = {
      type: 'cache_operation',
      operation,
      cacheKey: key,
      httpMethod: method,
      url,
      ttl: ttl || null,
      timestamp: new Date().toISOString(),
    };

    if (process.env.LOG_CACHE_ACCESS === 'true') {
      this.logger.log(JSON.stringify(logData));
    } else {
      this.logger.debug(`[${operation}] ${key}`);
    }
  }
}
