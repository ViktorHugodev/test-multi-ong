import { Controller, Post, Body, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { IsString } from 'class-validator';

class SearchDto {
  @IsString()
  query: string;
}

@Controller('public/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async search(
    @Body() dto: SearchDto,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.searchService.intelligentSearch(
      dto.query,
      Number(page),
      Number(pageSize),
    );
  }
}
