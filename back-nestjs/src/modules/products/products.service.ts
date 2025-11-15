import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { ProductsCacheService } from './products-cache.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFiltersDto } from './dto/product-filters.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly cacheService: ProductsCacheService,
  ) {}

  /**
   * Create product - MUST belong to user's organization (multi-tenancy)
   * Cache strategy: Invalidate listings on create
   */
  async create(organizationId: string, createProductDto: CreateProductDto) {
    if (!organizationId) {
      throw new ForbiddenException('User must belong to an organization');
    }

    const product = await this.productsRepository.create({
      ...createProductDto,
      organizationId,
    });

    // Invalidate listings cache (new product should appear in lists)
    await this.cacheService.invalidateOnCreate(organizationId);

    return product;
  }

  /**
   * Find all products for an organization (multi-tenancy enforced)
   * Cache strategy: Cache listings for 5min
   */
  async findByOrganization(
    organizationId: string,
    filters?: ProductFiltersDto,
  ) {
    if (!organizationId) {
      throw new ForbiddenException('Organization ID required');
    }

    // Try cache first
    const cached = await this.cacheService.getProductListing(
      organizationId,
      filters || {},
    );

    if (cached) {
      this.logger.debug(
        `Cache HIT for org ${organizationId} listings`,
      );
      return cached;
    }

    // Cache miss - fetch from database
    this.logger.debug(
      `Cache MISS for org ${organizationId} listings`,
    );

    const result = await this.productsRepository.findByOrganization(
      organizationId,
      filters,
    );

    // Cache the result
    await this.cacheService.setProductListing(
      organizationId,
      filters || {},
      result,
    );

    return result;
  }

  /**
   * Find public products (marketplace view)
   * Cache strategy: Aggressive caching for 5min (high traffic endpoint)
   */
  async findPublicProducts(filters?: ProductFiltersDto) {
    // Try cache first
    const cached = await this.cacheService.getPublicListing(filters || {});

    if (cached) {
      this.logger.debug(`Cache HIT for public listings`);
      return cached;
    }

    // Cache miss - fetch from database
    this.logger.debug(`Cache MISS for public listings`);

    const result = await this.productsRepository.findPublicProducts(filters);

    // Cache the result
    await this.cacheService.setPublicListing(filters || {}, result);

    return result;
  }

  /**
   * Find one product - verify organization ownership
   * Cache strategy: Cache individual products for 10min
   */
  async findOne(id: string, organizationId?: string) {
    // Try cache first (only for public access, skip cache for org-specific)
    if (!organizationId) {
      const cached = await this.cacheService.getProduct(id);

      if (cached) {
        this.logger.debug(`Cache HIT for product ${id}`);
        return cached;
      }

      this.logger.debug(`Cache MISS for product ${id}`);
    }

    // Fetch from database
    let product;

    if (organizationId) {
      product = await this.productsRepository.findByIdWithOrganization(
        id,
        organizationId,
      );
    } else {
      product = await this.productsRepository.findById(id);
    }

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Cache for public access
    if (!organizationId) {
      await this.cacheService.setProduct(product);
    }

    return product;
  }

  /**
   * Update product - MUST belong to user's organization
   * Cache strategy: Invalidate product + all listings on update
   */
  async update(
    id: string,
    organizationId: string,
    updateProductDto: UpdateProductDto,
  ) {
    if (!organizationId) {
      throw new ForbiddenException('User must belong to an organization');
    }

    // Verify ownership
    const product = await this.productsRepository.findByIdWithOrganization(
      id,
      organizationId,
    );

    if (!product) {
      throw new NotFoundException(
        `Product not found or does not belong to your organization`,
      );
    }

    const updated = await this.productsRepository.update(id, updateProductDto);

    // Invalidate cache (product changed, listings might change)
    await this.cacheService.invalidateOnUpdate(id, organizationId);

    return updated;
  }

  /**
   * Delete product - MUST belong to user's organization
   * Cache strategy: Invalidate product + all listings on delete
   */
  async remove(id: string, organizationId: string) {
    if (!organizationId) {
      throw new ForbiddenException('User must belong to an organization');
    }

    // Verify ownership
    const product = await this.productsRepository.findByIdWithOrganization(
      id,
      organizationId,
    );

    if (!product) {
      throw new NotFoundException(
        `Product not found or does not belong to your organization`,
      );
    }

    const result = await this.productsRepository.softDelete(id);

    // Invalidate cache (product deleted, must remove from all listings)
    await this.cacheService.invalidateOnDelete(id, organizationId);

    return result;
  }

  /**
   * Reserve stock with concurrency control
   * Cache strategy: Invalidate product on stock change
   */
  async reserveStock(
    productId: string,
    organizationId: string,
    quantity: number,
  ) {
    const result = await this.productsRepository.updateStockWithLock(
      productId,
      organizationId,
      quantity,
    );

    // Invalidate product cache (stock changed)
    await this.cacheService.invalidateOnUpdate(productId, organizationId);

    return result;
  }
}
