import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  async search(@Query('q') query: string) {
    if (!query) {
      return { error: 'Query parameter "q" is required' };
    }

    return this.searchService.search(query);
  }

  @Public()
  @Get('analytics')
  async analytics(@Query('limit') limit?: string) {
    return this.searchService.getAnalytics(
      limit ? parseInt(limit, 10) : 100,
    );
  }
}
