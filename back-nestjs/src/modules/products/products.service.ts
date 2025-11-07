import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFiltersDto } from './dto/product-filters.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  /**
   * Create product - MUST belong to user's organization (multi-tenancy)
   */
  async create(organizationId: string, createProductDto: CreateProductDto) {
    if (!organizationId) {
      throw new ForbiddenException('User must belong to an organization');
    }

    return this.productsRepository.create({
      ...createProductDto,
      organizationId,
    });
  }

  /**
   * Find all products for an organization (multi-tenancy enforced)
   */
  async findByOrganization(
    organizationId: string,
    filters?: ProductFiltersDto,
  ) {
    if (!organizationId) {
      throw new ForbiddenException('Organization ID required');
    }

    return this.productsRepository.findByOrganization(organizationId, filters);
  }

  /**
   * Find public products (marketplace view)
   */
  async findPublicProducts(filters?: ProductFiltersDto) {
    return this.productsRepository.findPublicProducts(filters);
  }

  /**
   * Find one product - verify organization ownership
   */
  async findOne(id: string, organizationId?: string) {
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

    return product;
  }

  /**
   * Update product - MUST belong to user's organization
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

    return this.productsRepository.update(id, updateProductDto);
  }

  /**
   * Delete product - MUST belong to user's organization
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

    return this.productsRepository.softDelete(id);
  }

  /**
   * Reserve stock with concurrency control
   */
  async reserveStock(
    productId: string,
    organizationId: string,
    quantity: number,
  ) {
    return this.productsRepository.updateStockWithLock(
      productId,
      organizationId,
      quantity,
    );
  }
}
