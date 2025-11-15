import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { PublicSearchController } from './public-search.controller';
import { SearchService } from './search.service';
import { LLMService } from './llm/llm.service';
import { TextSearchService } from './fallback/text-search.service';

@Module({
  controllers: [SearchController, PublicSearchController],
  providers: [SearchService, LLMService, TextSearchService],
})
export class SearchModule {}
