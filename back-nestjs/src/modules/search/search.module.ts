import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { LlmService } from './llm/llm.service';
import { TextSearchService } from './fallback/text-search.service';
import { ProductsModule } from '../products/products.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, ProductsModule],
  controllers: [SearchController],
  providers: [SearchService, LlmService, TextSearchService],
  exports: [SearchService],
})
export class SearchModule {}
