import { Injectable } from '@nestjs/common';
import { SearchFilters } from '../llm/llm.service';

@Injectable()
export class TextSearchService {
  generateFallbackFilters(query: string): SearchFilters {
    const keywords = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2);

    return {
      category: null,
      priceMin: null,
      priceMax: null,
      keywords,
    };
  }
}
