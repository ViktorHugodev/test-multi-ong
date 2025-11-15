// ========================================
// Arquivo: src/hooks/use-intelligent-search.ts
// Descrição: Hook customizado para gerenciar busca inteligente com debounce
// ========================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { searchApi } from '@/lib/api/search';
import { SearchState, SearchFilters } from '@/components/catalog/types';

const INITIAL_STATE: SearchState = {
  query: '',
  filters: {},
  results: [],
  meta: null,
  loading: false,
  error: null,
};

interface UseIntelligentSearchOptions {
  pageSize?: number;
  debounceMs?: number;
  autoSearch?: boolean;
}

export function useIntelligentSearch(options: UseIntelligentSearchOptions = {}) {
  const { pageSize = 20, debounceMs = 500, autoSearch = true } = options;

  const [state, setState] = useState<SearchState>(INITIAL_STATE);
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounce(state.query, debounceMs);

  // Executar busca
  const executeSearch = useCallback(
    async (searchQuery: string, searchFilters: SearchFilters, currentPage: number) => {
      if (!searchQuery || searchQuery.trim().length < 3) {
        setState((prev) => ({
          ...prev,
          results: [],
          meta: null,
          error: null,
        }));
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await searchApi.intelligentSearch({
          query: searchQuery.trim(),
          filters: searchFilters,
          page: currentPage,
          pageSize,
        });

        setState((prev) => ({
          ...prev,
          results: response.results,
          meta: response.meta,
          loading: false,
          error: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao buscar produtos';

        setState((prev) => ({
          ...prev,
          results: [],
          meta: null,
          loading: false,
          error: errorMessage,
        }));
      }
    },
    [pageSize]
  );

  // Auto busca quando query muda (com debounce)
  useEffect(() => {
    if (autoSearch && debouncedQuery) {
      executeSearch(debouncedQuery, state.filters, page);
    }
  }, [debouncedQuery, autoSearch, state.filters, page, executeSearch]);

  // Atualizar query
  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }));
    setPage(1); // Reset página ao mudar query
  }, []);

  // Atualizar filtros
  const setFilters = useCallback((filters: SearchFilters) => {
    setState((prev) => ({
      ...prev,
      filters,
    }));
    setPage(1); // Reset página ao mudar filtros
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: {},
    }));
    setPage(1);
  }, []);

  // Limpar tudo
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setPage(1);
  }, []);

  // Busca manual (ignorando debounce)
  const search = useCallback(() => {
    if (state.query) {
      executeSearch(state.query, state.filters, page);
    }
  }, [state.query, state.filters, page, executeSearch]);

  // Retry em caso de erro
  const retry = useCallback(() => {
    if (state.query) {
      executeSearch(state.query, state.filters, page);
    }
  }, [state.query, state.filters, page, executeSearch]);

  // Navegação de páginas
  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1) {
      setPage(newPage);
    }
  }, []);

  const nextPage = useCallback(() => {
    if (state.meta && page < state.meta.totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [state.meta, page]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  // Verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return !!(
      state.filters.category ||
      state.filters.priceMin !== undefined ||
      state.filters.priceMax !== undefined
    );
  }, [state.filters]);

  // Estados derivados
  const isEmpty = !state.loading && state.results.length === 0 && !!debouncedQuery;
  const hasError = !state.loading && !!state.error;
  const hasResults = state.results.length > 0;

  return {
    // Estado
    query: state.query,
    filters: state.filters,
    results: state.results,
    meta: state.meta,
    loading: state.loading,
    error: state.error,
    page,

    // Estados derivados
    isEmpty,
    hasError,
    hasResults,
    hasActiveFilters,

    // Ações
    setQuery,
    setFilters,
    clearFilters,
    reset,
    search,
    retry,

    // Paginação
    goToPage,
    nextPage,
    prevPage,
  };
}

// ========================================
// Notas de Implementação:
// - Debounce de 500ms por padrão para evitar chamadas excessivas
// - Auto busca quando query muda (pode ser desabilitado)
// - Validação de query mínima de 3 caracteres
// - Reset de página ao mudar query ou filtros
// - Funções memoizadas com useCallback para performance
// - Estados derivados (isEmpty, hasError, etc.) calculados com useMemo
// - Suporte completo a paginação
// - Função retry para recuperação de erros
// ========================================
