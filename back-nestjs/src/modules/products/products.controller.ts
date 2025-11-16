import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../auth/guards/organization.guard';
import { RequiresOrgAccess } from '../../auth/decorators/requires-org-access.decorator';
import { CurrentOrganization } from '../../auth/decorators/current-organization.decorator';
import { Cacheable } from '../../common/cache/decorators/cacheable.decorator';
import { CacheLoggingInterceptor } from '../../common/cache/interceptors/cache-logging.interceptor';

/**
 * Private products controller - for ONG managers/staff
 * Enforces strict multi-tenancy with automatic caching
 *
 * Caching Strategy:
 * - GET /products (list): 5 min TTL - High traffic, moderate change frequency
 * - GET /products/:id (detail): 10 min TTL - Less frequent access, rarely changes
 * - POST/PATCH/DELETE: No caching - Write operations invalidate related cache
 */
@Controller('products')
@UseGuards(JwtAuthGuard, OrganizationGuard)
@UseInterceptors(CacheLoggingInterceptor)
@RequiresOrgAccess()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @CurrentOrganization() organizationId: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(organizationId, createProductDto);
  }

  /**
   * Get all products for the organization with caching
   *
   * Cache key format:
   * products:ProductsController:findAll:{orgId}:{filters}
   *
   * TTL: 5 minutes (300 seconds)
   * Invalidated on: create, update, delete operations
   */
  @Get()
  @Cacheable({ ttl: 300, keyPrefix: 'products:list' })
  findAll(
    @CurrentOrganization() organizationId: string,
    @Query() filters: ProductFiltersDto,
  ) {
    return this.productsService.findByOrganization(organizationId, filters);
  }

  /**
   * Get single product by ID with caching
   *
   * Cache key format:
   * products:ProductsController:findOne:{orgId}:id_{productId}
   *
   * TTL: 10 minutes (600 seconds) - product details change less frequently
   * Invalidated on: update, delete operations for this specific product
   */
  @Get(':id')
  @Cacheable({ ttl: 600, keyPrefix: 'products:detail' })
  findOne(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    return this.productsService.findOne(id, organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, organizationId, updateProductDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentOrganization() organizationId: string,
  ) {
    return this.productsService.remove(id, organizationId);
  }
}
