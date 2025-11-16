// ========================================
// Arquivo: src/components/catalog/search/example-usage.tsx
// Descrição: Exemplo de uso do componente SearchFiltersComponent
// ========================================

'use client';

import { useState } from 'react';
import { SearchFiltersComponent } from './search-filters';
import { SearchFilters } from '@/components/catalog/types';

/**
 * Exemplo de uso do componente de filtros
 * Este é um componente de demonstração que mostra como integrar
 * o SearchFiltersComponent em sua aplicação
 */
export function ExampleUsage() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>({});

  const handleFiltersChange = (newFilters: SearchFilters) => {
    console.log('Filtros aplicados:', newFilters);
    setAppliedFilters(newFilters);
    
    // Aqui você faria a chamada à API
    // Por exemplo:
    // await searchApi.intelligentSearch({
    //   query: 'sua busca',
    //   filters: newFilters,
    //   page: 1,
    //   pageSize: 20
    // });
  };

  const handleClearFilters = () => {
    console.log('Filtros limpos');
    setFilters({});
    setAppliedFilters({});
  };

  const hasActiveFilters = !!(
    appliedFilters.keyword ||
    appliedFilters.category ||
    appliedFilters.priceMin !== undefined ||
    appliedFilters.priceMax !== undefined
  );

  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar com Filtros */}
        <aside className="lg:col-span-1">
          <SearchFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {/* Área de Resultados */}
        <main className="lg:col-span-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Resultados da Busca</h2>
            
            {/* Mostrar filtros aplicados */}
            {hasActiveFilters && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Filtros Aplicados:
                </h3>
                <div className="space-y-1 text-sm text-blue-800">
                  {appliedFilters.keyword && (
                    <p>
                      <strong>Texto:</strong> "{appliedFilters.keyword}"
                    </p>
                  )}
                  {appliedFilters.category && (
                    <p>
                      <strong>Categoria:</strong> {appliedFilters.category}
                    </p>
                  )}
                  {appliedFilters.priceMin !== undefined && (
                    <p>
                      <strong>Preço Mínimo:</strong> R${' '}
                      {appliedFilters.priceMin.toFixed(2)}
                    </p>
                  )}
                  {appliedFilters.priceMax !== undefined && (
                    <p>
                      <strong>Preço Máximo:</strong> R${' '}
                      {appliedFilters.priceMax.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Placeholder para resultados */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">
                {hasActiveFilters
                  ? 'Aqui apareceriam os resultados filtrados'
                  : 'Aplique filtros para ver os resultados'}
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({ filters, appliedFilters, hasActiveFilters }, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ========================================
// Exemplo de Integração com Hook Customizado
// ========================================

/**
 * Exemplo de como integrar com o hook useIntelligentSearch
 */
export function ExampleWithHook() {
  // Descomente para usar com o hook real
  /*
  const {
    filters,
    results,
    loading,
    error,
    hasActiveFilters,
    setFilters,
    clearFilters,
  } = useIntelligentSearch({
    pageSize: 20,
    debounceMs: 500,
    autoSearch: true,
  });

  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1">
          <SearchFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        <main className="lg:col-span-2">
          {loading && <p>Carregando...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
  */
}

// ========================================
// Exemplo de Uso Programático
// ========================================

/**
 * Exemplo de como definir filtros programaticamente
 */
export function ExampleProgrammatic() {
  const [filters, setFilters] = useState<SearchFilters>({});

  // Definir filtros pré-definidos
  const applyPresetFilters = (preset: 'cheap' | 'expensive' | 'food') => {
    switch (preset) {
      case 'cheap':
        setFilters({
          priceMax: 50,
          keyword: 'promoção',
        });
        break;
      case 'expensive':
        setFilters({
          priceMin: 100,
        });
        break;
      case 'food':
        setFilters({
          category: 'Alimentos',
          keyword: 'orgânico',
        });
        break;
    }
  };

  return (
    <div className="container mx-auto p-8">
      {/* Botões de Preset */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => applyPresetFilters('cheap')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Produtos Baratos
        </button>
        <button
          onClick={() => applyPresetFilters('expensive')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Produtos Premium
        </button>
        <button
          onClick={() => applyPresetFilters('food')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Alimentos Orgânicos
        </button>
      </div>

      {/* Componente de Filtros */}
      <SearchFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onClear={() => setFilters({})}
        hasActiveFilters={Object.keys(filters).length > 0}
      />
    </div>
  );
}

// ========================================
// Notas de Implementação:
// - ExampleUsage: Exemplo básico com estado local
// - ExampleWithHook: Exemplo com hook customizado (comentado)
// - ExampleProgrammatic: Exemplo com filtros pré-definidos
// - Todos os exemplos são funcionais e podem ser usados como referência
// - Debug info incluído para facilitar desenvolvimento
// ========================================
