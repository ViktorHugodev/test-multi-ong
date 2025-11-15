import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { SearchService } from './search.service';
import { SearchRequestDto } from './dto/search-request.dto';

/**
 * PublicSearchController
 *
 * Expõe rotas públicas de busca em `/api/public/search`, delegando para o
 * `SearchService` (que já é usado pelo `SearchController` principal).
 */
@Controller('public/search')
export class PublicSearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * GET /api/public/search
   * Busca via query string
   */
  @Public()
  @Get()
  async searchGet(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.searchService.intelligentSearch(query, page, pageSize);
  }

  /**
   * POST /api/public/search
   * Busca via body JSON
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async searchPost(@Body() searchDto: SearchRequestDto) {
    const { query, page = 1, pageSize = 20 } = searchDto;
    return this.searchService.intelligentSearch(query, page, pageSize);
  }
}
