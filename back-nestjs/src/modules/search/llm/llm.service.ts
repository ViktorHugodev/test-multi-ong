import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SearchFilters {
  category: string | null;
  priceMin: number | null;
  priceMax: number | null;
  keywords: string[];
}

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(private config: ConfigService) {
    this.apiUrl = this.config.get('LLM_API_URL');
    this.apiKey = this.config.get('LLM_API_KEY');
    this.timeout = this.config.get('LLM_TIMEOUT', 3000);
  }

  async extractFilters(query: string): Promise<SearchFilters> {
    const startTime = Date.now();

    try {
      const filters = await Promise.race([
        this.callLLM(query),
        this.timeoutPromise(this.timeout),
      ]);

      const latency = Date.now() - startTime;
      this.logger.log(`LLM extraction successful in ${latency}ms`);

      return filters;
    } catch (error) {
      const latency = Date.now() - startTime;

      if (error.message === 'LLM_TIMEOUT') {
        this.logger.warn(`LLM timeout after ${latency}ms`);
      } else {
        this.logger.error(`LLM error: ${error.message}`);
      }

      throw error;
    }
  }

  private async callLLM(query: string): Promise<SearchFilters> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: query },
        ],
        temperature: 0.1,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse and validate JSON
    let filters: SearchFilters;
    try {
      filters = JSON.parse(content);
    } catch (error) {
      throw new Error('Invalid JSON from LLM');
    }

    // Validate structure
    if (!this.isValidFilters(filters)) {
      throw new Error('Invalid filter structure from LLM');
    }

    return filters;
  }

  private getSystemPrompt(): string {
    return `You are a product search filter generator for a Brazilian marketplace.
Convert natural language queries into structured JSON filters.

Output format:
{
  "category": string | null,
  "priceMin": number | null,
  "priceMax": number | null,
  "keywords": string[]
}

Valid categories: "Artesanato", "Alimentos", "Vestuário", "Decoração", "Doces"

Examples:
Input: "doces até 50 reais"
Output: {"category":"Doces","priceMin":null,"priceMax":50,"keywords":["doce"]}

Input: "artesanato barato"
Output: {"category":"Artesanato","priceMin":null,"priceMax":null,"keywords":["barato"]}

Input: "roupas acima de 100 reais"
Output: {"category":"Vestuário","priceMin":100,"priceMax":null,"keywords":["roupa"]}

Only return valid JSON, no explanations.`;
  }

  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('LLM_TIMEOUT')), ms);
    });
  }

  private isValidFilters(filters: any): filters is SearchFilters {
    return (
      typeof filters === 'object' &&
      (filters.category === null || typeof filters.category === 'string') &&
      (filters.priceMin === null || typeof filters.priceMin === 'number') &&
      (filters.priceMax === null || typeof filters.priceMax === 'number') &&
      Array.isArray(filters.keywords)
    );
  }
}
