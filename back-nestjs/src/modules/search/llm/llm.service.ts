import { Injectable, Logger } from '@nestjs/common';

/**
 * LLM Service for intelligent search parsing
 * In production, this would integrate with OpenAI, Anthropic, or similar
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  /**
   * Parse natural language query into structured filters
   * Example: "cheap red shirts under $50" -> { category: "shirts", color: "red", maxPrice: 50 }
   */
  async parseQuery(query: string): Promise<{
    success: boolean;
    filters?: any;
    error?: string;
  }> {
    try {
      // TODO: Integrate with actual LLM API (OpenAI, Anthropic, etc.)
      // For now, use simple pattern matching as placeholder

      const filters: any = {};

      // Extract price patterns
      const priceMatch = query.match(/(?:under|below|less than|<)\s*\$?(\d+)/i);
      if (priceMatch) {
        filters.maxPrice = parseFloat(priceMatch[1]);
      }

      const minPriceMatch = query.match(
        /(?:above|over|more than|>)\s*\$?(\d+)/i,
      );
      if (minPriceMatch) {
        filters.minPrice = parseFloat(minPriceMatch[1]);
      }

      // Extract categories (simple keyword matching)
      const categories = ['artesanato', 'doces', 'decoracao', 'alimentos'];
      for (const category of categories) {
        if (query.toLowerCase().includes(category)) {
          filters.category =
            category.charAt(0).toUpperCase() + category.slice(1);
          break;
        }
      }

      // Clean query for text search (remove price and category mentions)
      const searchText = query
        .replace(
          /(?:under|below|less than|above|over|more than)\s*\$?\d+/gi,
          '',
        )
        .replace(new RegExp(categories.join('|'), 'gi'), '')
        .trim();

      if (searchText) {
        filters.search = searchText;
      }

      this.logger.log(
        `LLM parsed query: "${query}" -> ${JSON.stringify(filters)}`,
      );

      return {
        success: true,
        filters,
      };
    } catch (error) {
      this.logger.error(`LLM parsing failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
