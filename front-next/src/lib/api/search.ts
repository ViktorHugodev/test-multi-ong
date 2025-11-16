// ========================================
// Arquivo: src/lib/api/search.ts
// Descrição: Cliente HTTP para busca inteligente com suporte a filtros
// ========================================

import { apiClient } from './client';
import { SearchResponse, SearchFilters } from '@/components/catalog/types';

export interface SearchParams {
  query: string;
  filters?: SearchFilters;
  page?: number;
  pageSize?: number;
}

export const searchApi = {
  /**
   * Busca inteligente com LLM e fallback automático
   * @param params - Parâmetros de busca (query, filters, paginação)
   * @returns SearchResponse com resultados e metadados
   */
  intelligentSearch: async ({
    query,
    filters = {},
    page = 1,
    pageSize = 20,
  }: SearchParams): Promise<SearchResponse> => {
    // Validação de parâmetros
    if (!query || query.trim().length < 3) {
      throw new Error('Query deve ter no mínimo 3 caracteres');
    }

    if (pageSize < 1 || pageSize > 100) {
      throw new Error('PageSize deve estar entre 1 e 100');
    }

    if (filters.priceMin !== undefined && filters.priceMin < 0) {
      throw new Error('Preço mínimo não pode ser negativo');
    }

    if (
      filters.priceMin !== undefined &&
      filters.priceMax !== undefined &&
      filters.priceMax < filters.priceMin
    ) {
      throw new Error('Preço máximo deve ser maior que o preço mínimo');
    }

    // Construir query string com filtros
    let enhancedQuery = query;

    // Adicionar keyword aos filtros se fornecido
    if (filters.keyword && filters.keyword.trim().length > 0) {
      enhancedQuery += ` ${filters.keyword.trim()}`;
    }

    if (filters.category) {
      enhancedQuery += ` categoria:${filters.category}`;
    }

    if (filters.priceMin !== undefined) {
      enhancedQuery += ` preço mínimo:${filters.priceMin}`;
    }

    if (filters.priceMax !== undefined) {
      enhancedQuery += ` preço máximo:${filters.priceMax}`;
    }

    try {
      const response = await apiClient.post<SearchResponse>(
        '/search',
        { query: enhancedQuery, page, pageSize },
        {
          timeout: 30000, // 30 segundos
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
      }
      throw new Error('Erro desconhecido ao buscar produtos');
    }
  },
};

// ========================================
// Notas de Implementação:
// - Validações de parâmetros antes da chamada
// - Filtros são combinados na query para o LLM processar
// - Timeout de 30 segundos para busca
// - Tratamento de erros robusto
// - Tipagem forte com TypeScript
// ========================================
