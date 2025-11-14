import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { BaseRepository } from '../../database/repositories/base.repository';
import { Product, Prisma } from '@prisma/client';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';

@Injectable()
export class ProductsRepository extends BaseRepository<Product> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  getModel() {
    return this.prisma.product;
  }

  /**
   * Find products by organization with strict multi-tenancy
   */
  async findByOrganization(
    organizationId: string,
    filters?: ProductFiltersDto,
  ): Promise<PaginatedResponseDto<Product>> {
    const where: Prisma.ProductWhereInput = {
      organizationId,
      isActive: true,
      deletedAt: null,
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || filters?.limit || 20;
    const skip = (page - 1) * pageSize;

    // Ordenação dinâmica
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: { organization: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return new PaginatedResponseDto(items, page, pageSize, total);
  }

  /**
   * Find public products (for marketplace) - can see all active products
   */
  async findPublicProducts(
    filters?: ProductFiltersDto,
  ): Promise<PaginatedResponseDto<Product>> {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null,
      stockQty: { gt: 0 },
    };

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || filters?.limit || 20;
    const skip = (page - 1) * pageSize;

    // Ordenação dinâmica
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: { organization: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return new PaginatedResponseDto(items, page, pageSize, total);
  }

  /**
   * Update stock with optimistic locking for concurrency control
   */
  async updateStockWithLock(
    productId: string,
    organizationId: string,
    quantity: number,
  ): Promise<Product> {
    // Verify product belongs to organization (multi-tenancy check)
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        organizationId,
      },
    });

    if (!product) {
      throw new Error('Product not found or does not belong to organization');
    }

    if (product.stockQty < quantity) {
      throw new Error('Insufficient stock');
    }

    // Atomic stock update with version check (optimistic locking)
    return this.prisma.product.update({
      where: {
        id: productId,
        stockQty: { gte: quantity }, // Ensures stock is still available
      },
      data: {
        stockQty: { decrement: quantity },
      },
    });
  }

  async findByIdWithOrganization(
    productId: string,
    organizationId: string,
  ): Promise<Product | null> {
    return this.prisma.product.findFirst({
      where: {
        id: productId,
        organizationId,
        deletedAt: null,
      },
      include: { organization: true },
    });
  }
}
