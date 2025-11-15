import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { SearchService } from './search.service';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get('products')
  async search(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    if (!query || query.trim() === '') {
      return {
        results: [],
        meta: {
          page,
          pageSize,
          total: 0,
          totalPages: 0,
          aiSuccess: false,
          fallbackUsed: false,
          interpretation: 'Query vazia',
          latency: 0,
        },
      };
    }

    return this.searchService.intelligentSearch(query, page, pageSize);
  }

  @Public()
  @Get('health')
  async health() {
    return this.searchService.getHealthStatus();
  }
}
