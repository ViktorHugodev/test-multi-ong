// ========================================
// Arquivo: src/components/catalog/search/intelligent-search.tsx
// Descrição: Componente principal que orquestra busca inteligente e filtros
// ========================================

'use client';

import { Search } from 'lucide-react';

import { useIntelligentSearch } from '@/hooks/use-intelligent-search';
import { SearchStatus } from './search-status';
import { SearchFiltersComponent } from './search-filters';
import { SearchResults } from './search-results';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export function IntelligentSearch() {
  const {
    query,
    filters,
    results,
    meta,
    loading,
    error,
    isEmpty,
    hasActiveFilters,
    page,
    setQuery,
    setFilters,
    clearFilters,
    retry,
    goToPage,
    nextPage,
    prevPage,
  } = useIntelligentSearch({
    pageSize: 20,
    debounceMs: 500,
    autoSearch: true,
  });

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearchClick = () => {
    if (query.trim().length >= 3) {
      retry();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const renderPagination = () => {
    if (!meta || meta.totalPages <= 1) return null;

    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (meta.totalPages <= maxVisible) {
      for (let i = 1; i <= meta.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', meta.totalPages);
      } else if (page >= meta.totalPages - 2) {
        pages.push(
          1,
          'ellipsis',
          meta.totalPages - 3,
          meta.totalPages - 2,
          meta.totalPages - 1,
          meta.totalPages
        );
      } else {
        pages.push(1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', meta.totalPages);
      }
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => prevPage()}
              className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              aria-disabled={page === 1}
            />
          </PaginationItem>

          {pages.map((pageNum, index) =>
            pageNum === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => goToPage(pageNum)}
                  isActive={pageNum === page}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => nextPage()}
              className={
                page === meta.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
              }
              aria-disabled={page === meta.totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Busca Inteligente de Produtos
        </h1>
        <p className="text-gray-600">
          Use linguagem natural para encontrar produtos de forma rápida e inteligente
        </p>
      </div>

      {/* Busca e Filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar com Filtros */}
        <aside className="lg:col-span-1 space-y-6">
          <SearchFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {/* Conteúdo Principal */}
        <main className="lg:col-span-3 space-y-6">
          {/* Campo de Busca */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Ex: doces baratos até 30 reais, artesanato em madeira..."
                value={query}
                onChange={handleQueryChange}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-base"
                aria-label="Campo de busca inteligente"
              />
            </div>
            <Button
              onClick={handleSearchClick}
              disabled={query.trim().length < 3 || loading}
              className="h-12 px-6"
              aria-label="Buscar produtos"
            >
              <Search className="h-5 w-5 mr-2" />
              Buscar
            </Button>
          </div>

          {/* Validação de Query */}
          {query.length > 0 && query.trim().length < 3 && (
            <p className="text-sm text-yellow-600">
              Digite pelo menos 3 caracteres para buscar
            </p>
          )}

          {/* Status da Busca */}
          {meta && !loading && !error && (
            <SearchStatus meta={meta} showLatency={true} />
          )}

          {/* Resultados */}
          <SearchResults
            results={results}
            loading={loading}
            error={error}
            isEmpty={isEmpty}
            query={query}
            onRetry={retry}
          />

          {/* Paginação */}
          {renderPagination()}
        </main>
      </div>
    </div>
  );
}

// ========================================
// Notas de Implementação:
// - Layout responsivo com sidebar de filtros
// - Debounce automático de 500ms
// - Busca ao digitar (autoSearch=true)
// - Busca manual ao clicar ou pressionar Enter
// - Validação de query mínima (3 caracteres)
// - Paginação inteligente com ellipsis
// - Estados bem definidos (loading, error, empty, success)
// - Acessível com ARIA labels
// - Grid responsivo: stack mobile, sidebar desktop
// - Integração completa com hook customizado
// ========================================
