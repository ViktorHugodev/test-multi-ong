import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../../common/cache/cache.service';
import { Product } from '@prisma/client';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { ProductFiltersDto } from './dto/product-filters.dto';

/**
 * Products Cache Service
 *
 * Implements caching strategies for products:
 * - Individual products: 10min TTL
 * - Product listings: 5min TTL
 * - Public catalog: 5min TTL with aggressive caching
 *
 * Invalidation strategies:
 * - On UPDATE: Invalidate specific product + all listings
 * - On DELETE: Invalidate specific product + all listings
 * - On CREATE: Invalidate all listings only
 */
@Injectable()
export class ProductsCacheService {
  private readonly logger = new Logger(ProductsCacheService.name);

  // Cache configuration
  private readonly PRODUCT_TTL = 600; // 10 minutes
  private readonly LISTING_TTL = 300; // 5 minutes
  private readonly PRODUCT_PREFIX = 'product';
  private readonly LISTING_PREFIX = 'products:list';
  private readonly PUBLIC_LISTING_PREFIX = 'products:public';

  constructor(private cacheService: CacheService) {}

  /**
   * Get cached product by ID
   */
  async getProduct(productId: string): Promise<Product | null> {
    return this.cacheService.get<Product>(productId, {
      prefix: this.PRODUCT_PREFIX,
    });
  }

  /**
   * Cache a product
   */
  async setProduct(product: Product): Promise<void> {
    await this.cacheService.set(product.id, product, {
      prefix: this.PRODUCT_PREFIX,
      ttl: this.PRODUCT_TTL,
    });

    this.logger.debug(`Cached product: ${product.id}`);
  }

  /**
   * Get cached product listing
   */
  async getProductListing(
    organizationId: string,
    filters: ProductFiltersDto,
  ): Promise<PaginatedResponseDto<Product> | null> {
    const cacheKey = this.buildListingKey(organizationId, filters);

    return this.cacheService.get<PaginatedResponseDto<Product>>(cacheKey, {
      prefix: this.LISTING_PREFIX,
    });
  }

  /**
   * Cache product listing
   */
  async setProductListing(
    organizationId: string,
    filters: ProductFiltersDto,
    data: PaginatedResponseDto<Product>,
  ): Promise<void> {
    const cacheKey = this.buildListingKey(organizationId, filters);

    await this.cacheService.set(cacheKey, data, {
      prefix: this.LISTING_PREFIX,
      ttl: this.LISTING_TTL,
    });

    this.logger.debug(`Cached listing: ${cacheKey}`);
  }

  /**
   * Get cached public product listing
   */
  async getPublicListing(
    filters: ProductFiltersDto,
  ): Promise<PaginatedResponseDto<Product> | null> {
    const cacheKey = this.buildPublicListingKey(filters);

    return this.cacheService.get<PaginatedResponseDto<Product>>(cacheKey, {
      prefix: this.PUBLIC_LISTING_PREFIX,
    });
  }

  /**
   * Cache public product listing
   */
  async setPublicListing(
    filters: ProductFiltersDto,
    data: PaginatedResponseDto<Product>,
  ): Promise<void> {
    const cacheKey = this.buildPublicListingKey(filters);

    await this.cacheService.set(cacheKey, data, {
      prefix: this.PUBLIC_LISTING_PREFIX,
      ttl: this.LISTING_TTL,
    });

    this.logger.debug(`Cached public listing: ${cacheKey}`);
  }

  /**
   * Invalidate product cache on UPDATE
   * Strategy: Invalidate specific product + all related listings
   */
  async invalidateOnUpdate(
    productId: string,
    organizationId: string,
  ): Promise<void> {
    this.logger.log(
      `Invalidating cache for product ${productId} (UPDATE)`,
    );

    // Delete specific product cache
    await this.cacheService.del(productId, {
      prefix: this.PRODUCT_PREFIX,
    });

    // Delete all listings for this organization
    await this.cacheService.deletePattern(
      `${this.LISTING_PREFIX}:${organizationId}:*`,
    );

    // Delete all public listings (product might be in any filter combination)
    await this.cacheService.deletePattern(`${this.PUBLIC_LISTING_PREFIX}:*`);

    this.logger.log(`Cache invalidated for product ${productId}`);
  }

  /**
   * Invalidate product cache on DELETE
   * Strategy: Same as UPDATE (invalidate product + listings)
   */
  async invalidateOnDelete(
    productId: string,
    organizationId: string,
  ): Promise<void> {
    this.logger.log(
      `Invalidating cache for product ${productId} (DELETE)`,
    );

    await this.invalidateOnUpdate(productId, organizationId);
  }

  /**
   * Invalidate product cache on CREATE
   * Strategy: Invalidate only listings (new product should appear in lists)
   */
  async invalidateOnCreate(organizationId: string): Promise<void> {
    this.logger.log(
      `Invalidating listings cache for organization ${organizationId} (CREATE)`,
    );

    // Delete organization listings
    await this.cacheService.deletePattern(
      `${this.LISTING_PREFIX}:${organizationId}:*`,
    );

    // Delete public listings
    await this.cacheService.deletePattern(`${this.PUBLIC_LISTING_PREFIX}:*`);
  }

  /**
   * Invalidate all product caches for an organization
   * Used when doing bulk operations
   */
  async invalidateOrganization(organizationId: string): Promise<void> {
    this.logger.log(
      `Invalidating ALL cache for organization ${organizationId}`,
    );

    // This is aggressive - deletes all products and listings
    await this.cacheService.deletePattern(`${this.PRODUCT_PREFIX}:*`);
    await this.cacheService.deletePattern(
      `${this.LISTING_PREFIX}:${organizationId}:*`,
    );
    await this.cacheService.deletePattern(`${this.PUBLIC_LISTING_PREFIX}:*`);
  }

  /**
   * Clear all product caches
   * Use only for maintenance/debugging
   */
  async clearAll(): Promise<void> {
    this.logger.warn('⚠️ Clearing ALL product caches');

    await this.cacheService.deletePattern(`${this.PRODUCT_PREFIX}:*`);
    await this.cacheService.deletePattern(`${this.LISTING_PREFIX}:*`);
    await this.cacheService.deletePattern(`${this.PUBLIC_LISTING_PREFIX}:*`);
  }

  /**
   * Build cache key for organization product listing
   * Format: {orgId}:{category}:{minPrice}:{maxPrice}:{page}:{pageSize}
   */
  private buildListingKey(
    organizationId: string,
    filters: ProductFiltersDto,
  ): string {
    const parts = [
      organizationId,
      filters.category || 'all',
      filters.minPrice?.toString() || 'no-min',
      filters.maxPrice?.toString() || 'no-max',
      filters.search || 'no-search',
      filters.page?.toString() || '1',
      filters.pageSize?.toString() || '20',
      filters.sortBy || 'createdAt',
      filters.sortOrder || 'desc',
    ];

    return parts.join(':');
  }

  /**
   * Build cache key for public product listing
   * Format: {category}:{minPrice}:{maxPrice}:{page}:{pageSize}
   */
  private buildPublicListingKey(filters: ProductFiltersDto): string {
    const parts = [
      filters.organizationId || 'all-orgs',
      filters.category || 'all',
      filters.minPrice?.toString() || 'no-min',
      filters.maxPrice?.toString() || 'no-max',
      filters.search || 'no-search',
      filters.page?.toString() || '1',
      filters.pageSize?.toString() || '20',
      filters.sortBy || 'createdAt',
      filters.sortOrder || 'desc',
    ];

    return parts.join(':');
  }

  /**
   * Get cache statistics for products
   */
  async getStats(): Promise<any> {
    const client = this.cacheService.getClient();

    const productKeys = await client.keys(`${this.PRODUCT_PREFIX}:*`);
    const listingKeys = await client.keys(`${this.LISTING_PREFIX}:*`);
    const publicKeys = await client.keys(`${this.PUBLIC_LISTING_PREFIX}:*`);

    return {
      products: {
        count: productKeys.length,
        prefix: this.PRODUCT_PREFIX,
        ttl: this.PRODUCT_TTL,
      },
      listings: {
        count: listingKeys.length,
        prefix: this.LISTING_PREFIX,
        ttl: this.LISTING_TTL,
      },
      publicListings: {
        count: publicKeys.length,
        prefix: this.PUBLIC_LISTING_PREFIX,
        ttl: this.LISTING_TTL,
      },
      total: productKeys.length + listingKeys.length + publicKeys.length,
    };
  }

  /**
   * Warm up cache with popular queries
   *
   * This method is called on application startup to preload
   * commonly accessed data into cache, improving performance
   * for the first users.
   *
   * Strategies:
   * 1. Preload public product listings (most accessed endpoint)
   * 2. Preload popular categories
   * 3. Preload first page of results (most common pagination)
   *
   * @param warmupCallback - Callback function to fetch data from database
   */
  async warmCache(
    warmupCallback: (filters: ProductFiltersDto) => Promise<any>,
  ): Promise<void> {
    if (process.env.CACHE_WARMING_ENABLED !== 'true') {
      this.logger.log('Cache warming disabled (CACHE_WARMING_ENABLED=false)');
      return;
    }

    this.logger.log('🔥 Starting cache warming...');
    const startTime = Date.now();

    try {
      // Popular queries to preload
      const popularQueries: ProductFiltersDto[] = [
        // Default public listing (most common query)
        { page: 1, pageSize: 20 },

        // Popular categories (customize based on your marketplace)
        { category: 'Alimentos', page: 1, pageSize: 20 },
        { category: 'Roupas', page: 1, pageSize: 20 },
        { category: 'Artesanato', page: 1, pageSize: 20 },

        // Price ranges (common filters)
        { maxPrice: 50, page: 1, pageSize: 20 },
        { minPrice: 50, maxPrice: 100, page: 1, pageSize: 20 },
      ];

      let warmedCount = 0;

      // Execute all warmup queries in parallel
      await Promise.all(
        popularQueries.map(async (filters) => {
          try {
            const data = await warmupCallback(filters);
            await this.setPublicListing(filters, data);
            warmedCount++;
          } catch (error) {
            this.logger.warn(
              `Failed to warm cache for filters ${JSON.stringify(filters)}:`,
              error.message,
            );
          }
        }),
      );

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Cache warming completed: ${warmedCount}/${popularQueries.length} queries warmed in ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('Cache warming failed:', error);
    }
  }
}
