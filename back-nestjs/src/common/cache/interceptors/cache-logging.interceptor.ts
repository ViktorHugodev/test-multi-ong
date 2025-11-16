import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHEABLE_KEY } from '../decorators/cacheable.decorator';

export interface CacheLogEntry {
  type: 'cache_operation';
  method: string;
  url: string;
  duration: number;
  isCached: boolean;
  organizationId?: string;
  timestamp: string;
  statusCode?: number;
}

/**
 * Cache Logging Interceptor
 *
 * Logs all HTTP requests with cache-related information.
 * Useful for monitoring cache behavior and performance.
 *
 * Features:
 * - Logs request duration
 * - Identifies if endpoint is cacheable
 * - Includes multi-tenancy context (organizationId)
 * - Structured JSON output for log aggregation
 *
 * Usage:
 * Apply globally in AppModule or per-controller:
 * @UseInterceptors(CacheLoggingInterceptor)
 */
@Injectable()
export class CacheLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheLoggingInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = request;
    const startTime = Date.now();

    // Check if this endpoint has @Cacheable decorator
    const isCacheable = this.reflector.get<boolean>(
      CACHEABLE_KEY,
      context.getHandler(),
    );

    // Get organizationId for multi-tenancy context
    const organizationId =
      request.user?.organizationId ||
      request.organizationId ||
      undefined;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          const logEntry: CacheLogEntry = {
            type: 'cache_operation',
            method,
            url,
            duration,
            isCached: Boolean(isCacheable),
            organizationId,
            timestamp: new Date().toISOString(),
            statusCode,
          };

          // Log based on environment configuration
          if (process.env.LOG_CACHE_ACCESS === 'true') {
            this.logger.log(JSON.stringify(logEntry));
          } else {
            this.logger.debug(
              `[${method}] ${url} - ${duration}ms (cached: ${isCacheable || false})`,
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          const logEntry = {
            type: 'cache_operation',
            method,
            url,
            duration,
            isCached: Boolean(isCacheable),
            organizationId,
            timestamp: new Date().toISOString(),
            error: error.message,
            statusCode: error.status || 500,
          };

          this.logger.error(JSON.stringify(logEntry));
        },
      }),
    );
  }
}
