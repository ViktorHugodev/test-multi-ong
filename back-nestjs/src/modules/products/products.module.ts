import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PublicProductsController } from './public-products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsCacheService } from './products-cache.service';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';

/**
 * Products Module
 *
 * Features:
 * - Multi-tenant product management
 * - Redis caching with intelligent invalidation
 * - Cache warming on startup for popular queries
 * - Public marketplace endpoints
 */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ProductsController, PublicProductsController],
  providers: [ProductsService, ProductsRepository, ProductsCacheService],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule implements OnModuleInit {
  private readonly logger = new Logger(ProductsModule.name);

  constructor(
    private readonly productsService: ProductsService,
    private readonly productsCacheService: ProductsCacheService,
  ) {}

  /**
   * Warm up cache on module initialization
   *
   * This preloads popular queries into cache before the first
   * user request, improving response times for initial traffic.
   */
  async onModuleInit() {
    // Only warm cache in production or when explicitly enabled
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.CACHE_WARMING_ENABLED !== 'true'
    ) {
      this.logger.log(
        'Cache warming skipped (not in production, set CACHE_WARMING_ENABLED=true to force)',
      );
      return;
    }

    try {
      await this.productsCacheService.warmCache(async (filters) => {
        return this.productsService.findPublicProducts(filters);
      });
    } catch (error) {
      this.logger.error('Failed to warm cache on startup:', error);
      // Don't throw - cache warming failure shouldn't prevent app startup
    }
  }
}
