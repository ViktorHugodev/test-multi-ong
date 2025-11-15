import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface StructuredLog {
  timestamp: string;
  route: string;
  method: string;
  status?: number;
  latency: number;
  userId?: string | null;
  organizationId?: string | null;
  userAgent?: string;
  ip?: string;
  error?: string;
  stack?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly isProduction = process.env.NODE_ENV === 'production';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;
    const startTime = Date.now();

    // Log incoming request (optional, can be disabled in production)
    if (!this.isProduction) {
      this.logger.log(`→ ${method} ${url}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const latency = Date.now() - startTime;

          const logData: StructuredLog = {
            timestamp: new Date().toISOString(),
            route: url,
            method,
            status: response.statusCode,
            latency,
            userId: user?.id || null,
            organizationId: user?.organizationId || null,
            userAgent: headers['user-agent'],
            ip: ip || headers['x-forwarded-for'] || headers['x-real-ip'],
          };

          // Log as JSON in production, formatted in development
          if (this.isProduction || process.env.LOG_FORMAT === 'json') {
            this.logger.log(JSON.stringify(logData));
          } else {
            this.logger.log(
              `← ${method} ${url} - ${response.statusCode} - ${latency}ms` +
              (user?.id ? ` - User: ${user.id}` : '') +
              (user?.organizationId ? ` - Org: ${user.organizationId}` : ''),
            );
          }
        },
        error: (error) => {
          const latency = Date.now() - startTime;

          const logData: StructuredLog = {
            timestamp: new Date().toISOString(),
            route: url,
            method,
            status: error.status || 500,
            latency,
            userId: user?.id || null,
            organizationId: user?.organizationId || null,
            userAgent: headers['user-agent'],
            ip: ip || headers['x-forwarded-for'] || headers['x-real-ip'],
            error: error.message,
            stack: this.isProduction ? undefined : error.stack,
          };

          // Log as JSON in production, formatted in development
          if (this.isProduction || process.env.LOG_FORMAT === 'json') {
            this.logger.error(JSON.stringify(logData));
          } else {
            this.logger.error(
              `✗ ${method} ${url} - ${error.status || 500} - ${latency}ms - ${error.message}` +
              (user?.id ? ` - User: ${user.id}` : ''),
            );
          }
        },
      }),
    );
  }
}
