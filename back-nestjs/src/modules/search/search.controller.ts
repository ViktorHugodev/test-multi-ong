import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { SearchService } from './search.service';
import { Public } from '@/auth/decorators/public.decorator';
import { SearchRequestDto } from './dto/search-request.dto';

/**
 * SearchController
 *
 * Rotas públicas para busca inteligente de produtos usando LLM (OpenAI GPT-4o-mini)
 * com fallback automático para busca textual em caso de falha.
 *
 * Suporta tanto GET (query string) quanto POST (request body) para flexibilidade.
 */
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * GET /api/search
   * Busca via query string - ideal para URLs compartilháveis e cache
   *
   * @param query - Texto de busca em linguagem natural (ex: "doces baratos")
   * @param page - Número da página (default: 1)
   * @param pageSize - Itens por página (default: 20)
   *
   * Exemplo: GET /api/search?q=doces+baratos&page=1&pageSize=20
   */
  @Public()
  @Get()
  async searchGet(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.executeSearch(query, page, pageSize);
  }

  /**
   * POST /api/search
   * Busca via request body - ideal para queries complexas e privacidade
   *
   * @param searchDto - Objeto com query, page e pageSize
   *
   * Exemplo: POST /api/search
   * Body: { "query": "doces baratos", "page": 1, "pageSize": 20 }
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK) // POST de busca retorna 200, não 201
  async searchPost(@Body() searchDto: SearchRequestDto) {
    const { query, page = 1, pageSize = 20 } = searchDto;
    return this.executeSearch(query, page, pageSize);
  }

  /**
   * GET /api/search/products (rota legada - mantida para compatibilidade)
   * @deprecated Use GET /api/search ou POST /api/search
   */
  @Public()
  @Get('products')
  async searchLegacy(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.executeSearch(query, page, pageSize);
  }

  /**
   * GET /api/search/health
   * Verifica status do LLM service e circuit breaker
   */
  @Public()
  @Get('health')
  async health() {
    return this.searchService.getHealthStatus();
  }

  /**
   * Executa a busca inteligente com validação de query vazia
   * Centraliza lógica compartilhada entre GET e POST
   */
  private async executeSearch(query: string, page: number, pageSize: number) {
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
}
