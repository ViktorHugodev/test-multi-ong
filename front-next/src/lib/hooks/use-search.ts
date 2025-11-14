'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './use-debounce';

export interface SearchMetadata {
  searchMethod: 'llm' | 'fallback';
  appliedFilters: any;
  interpretation: string;
  latency: number;
  aiSuccess: boolean;
  fallbackUsed: boolean;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SearchResponse {
  results: any[];
  meta: Pagination & {
    aiSuccess: boolean;
    fallbackUsed: boolean;
    interpretation: string;
    latency: number;
  };
}

export function useSearch(initialQuery = '', initialPage = 1, initialPageSize = 20) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0,
  });
  const [metadata, setMetadata] = useState<SearchMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 500);

  const performSearch = useCallback(
    async (searchQuery: string, page = 1) => {
      if (!searchQuery || searchQuery.trim() === '') {
        setResults([]);
        setPagination({
          page: 1,
          pageSize: initialPageSize,
          total: 0,
          totalPages: 0,
        });
        setMetadata(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
        const params = new URLSearchParams({
          q: searchQuery,
          page: page.toString(),
          pageSize: initialPageSize.toString(),
        });

        const response = await fetch(`${apiUrl}/search/products?${params}`);

        if (!response.ok) {
          throw new Error('Erro ao buscar produtos');
        }

        const data: SearchResponse = await response.json();

        setResults(data.results || []);
        setPagination({
          page: data.meta.page,
          pageSize: data.meta.pageSize,
          total: data.meta.total,
          totalPages: data.meta.totalPages,
        });
        setMetadata({
          searchMethod: data.meta.aiSuccess ? 'llm' : 'fallback',
          appliedFilters: {},
          interpretation: data.meta.interpretation,
          latency: data.meta.latency,
          aiSuccess: data.meta.aiSuccess,
          fallbackUsed: data.meta.fallbackUsed,
        });
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar produtos');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [initialPageSize],
  );

  useEffect(() => {
    performSearch(debouncedQuery, pagination.page);
  }, [debouncedQuery]);

  const retry = useCallback(() => {
    performSearch(query, pagination.page);
  }, [query, pagination.page, performSearch]);

  const changePage = useCallback(
    (newPage: number) => {
      setPagination((prev) => ({ ...prev, page: newPage }));
      performSearch(query, newPage);
    },
    [query, performSearch],
  );

  return {
    query,
    setQuery,
    results,
    pagination,
    metadata,
    isLoading,
    error,
    retry,
    changePage,
  };
}
