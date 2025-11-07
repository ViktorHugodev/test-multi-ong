import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductFiltersDto } from './dto/product-filters.dto';
import { Public } from '../../auth/decorators/public.decorator';

/**
 * Public products controller - for marketplace (customers)
 * No authentication required
 */
@Controller('public/products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findAll(@Query() filters: ProductFiltersDto) {
    return this.productsService.findPublicProducts(filters);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
