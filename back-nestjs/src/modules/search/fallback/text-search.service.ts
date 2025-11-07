import { Injectable, Logger } from '@nestjs/common';

/**
 * Fallback text search service
 * Used when LLM parsing fails or is unavailable
 */
@Injectable()
export class TextSearchService {
  private readonly logger = new Logger(TextSearchService.name);

  /**
   * Simple fallback search using basic text matching
   */
  async search(query: string): Promise<any> {
    this.logger.log(`Fallback search for: "${query}"`);

    // Basic filters
    const filters: any = {
      search: query.trim(),
    };

    // Simple price extraction
    const priceMatch = query.match(/\$?(\d+)/);
    if (priceMatch) {
      filters.maxPrice = parseFloat(priceMatch[1]);
    }

    return filters;
  }
}
