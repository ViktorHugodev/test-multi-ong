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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../auth/guards/organization.guard';
import { RequiresOrgAccess } from '../../auth/decorators/requires-org-access.decorator';
import { CurrentOrganization } from '../../auth/decorators/current-organization.decorator';

/**
 * Private products controller - for ONG managers/staff
 * Enforces strict multi-tenancy
 */
@Controller('products')
@UseGuards(JwtAuthGuard, OrganizationGuard)
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

  @Get()
  findAll(
    @CurrentOrganization() organizationId: string,
    @Query() filters: ProductFiltersDto,
  ) {
    return this.productsService.findByOrganization(organizationId, filters);
  }

  @Get(':id')
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
