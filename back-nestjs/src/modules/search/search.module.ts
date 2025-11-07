import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { LLMService } from './llm/llm.service';
import { TextSearchService } from './fallback/text-search.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, LLMService, TextSearchService],
})
export class SearchModule {}
