import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { LLMService, SearchFilters } from './llm/llm.service';
import { TextSearchService } from './fallback/text-search.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly textSearchService: TextSearchService,
  ) {}

  async intelligentSearch(query: string, page = 1, pageSize = 20) {
    const startTime = Date.now();
    let aiSuccess = false;
    let fallbackUsed = false;
    let filters: SearchFilters;

    // Try AI first
    try {
      filters = await this.llmService.extractFilters(query);
      aiSuccess = true;
    } catch (error) {
      // AI failed - use fallback
      this.logger.warn(`AI failed, using fallback: ${error.message}`);
      filters = this.textSearchService.generateFallbackFilters(query);
      fallbackUsed = true;
    }

    // Apply filters to database
    const results = await this.applyFilters(filters, page, pageSize);
    const latency = Date.now() - startTime;

    // Log search
    await this.logSearch(query, filters, aiSuccess, fallbackUsed, latency, results.meta.total);

    return {
      results: results.items,
      meta: {
        ...results.meta,
        aiSuccess,
        fallbackUsed,
        interpretation: this.formatInterpretation(filters),
        latency,
      },
    };
  }

  private async applyFilters(filters: SearchFilters, page: number, pageSize: number) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      stockQty: { gt: 0 },
    };

    if (filters.category) {
      where.category = { equals: filters.category, mode: 'insensitive' };
    }

    if (filters.priceMin !== null || filters.priceMax !== null) {
      where.price = {};
      if (filters.priceMin !== null) where.price.gte = filters.priceMin;
      if (filters.priceMax !== null) where.price.lte = filters.priceMax;
    }

    if (filters.keywords && filters.keywords.length > 0) {
      where.OR = [
        { name: { contains: filters.keywords.join(' '), mode: 'insensitive' } },
        { description: { contains: filters.keywords.join(' '), mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  private formatInterpretation(filters: SearchFilters): string {
    const parts: string[] = [];

    if (filters.category) {
      parts.push(`Categoria = ${filters.category}`);
    }

    if (filters.priceMin !== null) {
      parts.push(`Preço ≥ R$ ${filters.priceMin.toFixed(2)}`);
    }

    if (filters.priceMax !== null) {
      parts.push(`Preço ≤ R$ ${filters.priceMax.toFixed(2)}`);
    }

    if (filters.keywords.length > 0) {
      parts.push(`Palavras-chave: ${filters.keywords.join(', ')}`);
    }

    return parts.length > 0 ? `Resultados para: ${parts.join('; ')}` : 'Todos os produtos';
  }

  private async logSearch(
    query: string,
    filters: SearchFilters,
    aiSuccess: boolean,
    fallbackUsed: boolean,
    latency: number,
    resultsCount: number,
  ) {
    try {
      await this.prisma.searchLog.create({
        data: {
          query,
          filters: filters as any,
          aiSuccess,
          fallbackUsed,
          latency,
          resultsCount,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log search', error);
    }
  }
}
