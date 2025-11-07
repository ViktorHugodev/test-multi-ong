import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm/llm.service';
import { TextSearchService } from './fallback/text-search.service';
import { ProductsService } from '../products/products.service';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly llmService: LlmService,
    private readonly textSearchService: TextSearchService,
    private readonly productsService: ProductsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Intelligent search with AI + fallback
   * Logs all searches for analytics
   */
  async search(query: string) {
    const startTime = Date.now();
    let aiSuccess = false;
    let fallbackUsed = false;
    let filters: any = {};

    try {
      // Try LLM parsing first
      const llmResult = await this.llmService.parseQuery(query);

      if (llmResult.success && llmResult.filters) {
        aiSuccess = true;
        filters = llmResult.filters;
        this.logger.log('Using AI-parsed filters');
      } else {
        // Fallback to text search
        fallbackUsed = true;
        filters = await this.textSearchService.search(query);
        this.logger.log('Using fallback text search');
      }

      // Execute search
      const results = await this.productsService.findPublicProducts(filters);

      // Calculate latency
      const latency = Date.now() - startTime;

      // Log search for analytics
      await this.logSearch({
        query,
        filters,
        aiSuccess,
        fallbackUsed,
        latency,
        resultsCount: results.total,
      });

      return {
        query,
        filters,
        aiSuccess,
        fallbackUsed,
        results: results.products,
        total: results.total,
        latency,
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Log search for analytics and improvement
   */
  private async logSearch(data: {
    query: string;
    filters: any;
    aiSuccess: boolean;
    fallbackUsed: boolean;
    latency: number;
    resultsCount: number;
  }) {
    try {
      await this.prisma.searchLog.create({
        data: {
          query: data.query,
          filters: data.filters,
          aiSuccess: data.aiSuccess,
          fallbackUsed: data.fallbackUsed,
          latency: data.latency,
          resultsCount: data.resultsCount,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log search: ${error.message}`);
    }
  }

  /**
   * Get search analytics
   */
  async getAnalytics(limit = 100) {
    const logs = await this.prisma.searchLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = logs.length;
    const aiSuccessRate =
      (logs.filter((l) => l.aiSuccess).length / total) * 100;
    const avgLatency = logs.reduce((sum, l) => sum + l.latency, 0) / total;

    return {
      total,
      aiSuccessRate: aiSuccessRate.toFixed(2),
      avgLatency: avgLatency.toFixed(2),
      recentSearches: logs.slice(0, 20),
    };
  }
}
