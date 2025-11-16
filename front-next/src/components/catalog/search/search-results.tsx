// ========================================
// Arquivo: src/components/catalog/search/search-results.tsx
// Descrição: Grid de resultados com estados de loading, empty e error
// ========================================

import { AlertCircle, Package, RefreshCw } from 'lucide-react';

import { Product } from '@/types/product.types';
import { ProductCard } from './product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SearchResultsProps {
  results: Product[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  query: string;
  onRetry?: () => void;
}

export function SearchResults({
  results,
  loading,
  error,
  isEmpty,
  query,
  onRetry,
}: SearchResultsProps) {
  // Estado de Loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Estado de Erro
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Erro ao buscar produtos</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>{error}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Estado Vazio
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Package className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-sm text-gray-600 max-w-md">
          Não encontramos produtos que correspondam à busca{' '}
          {query && (
            <span className="font-medium text-gray-900">&quot;{query}&quot;</span>
          )}
          . Tente usar palavras-chave diferentes ou ajustar os filtros.
        </p>
      </div>
    );
  }

  // Grid de Resultados
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {results.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// ========================================
// Notas de Implementação:
// - Skeleton loading com 8 cards placeholder
// - Estado de erro com botão retry
// - Estado vazio com mensagem personalizada
// - Grid responsivo: 1 col mobile → 2 tablet → 3 desktop → 4 wide
// - Gap consistente de 6 (24px)
// - Mensagens de erro amigáveis
// - Feedback visual claro para cada estado
// - Acessível com Alert components
// ========================================
