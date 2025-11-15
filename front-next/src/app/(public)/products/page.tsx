'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

import { productsApi } from '@/lib/api/products';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginatedResponse, Product } from '@/types/product.types';

// Helper function to check if data has valid structure
const hasValidProducts = (data: any): data is PaginatedResponse<Product> => {
  return Boolean(
    data &&
    typeof data === 'object' &&
    Array.isArray(data.items) &&
    data.items.length > 0 &&
    data.meta &&
    typeof data.meta === 'object'
  );
};

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Pegar filtros da URL
  const category = searchParams.get('category') || undefined;
  const priceMin = searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : undefined;
  const priceMax = searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page, category, priceMin, priceMax],
    queryFn: () => productsApi.getPublicProducts({
      page,
      pageSize,
      category,
      priceMin,
      priceMax,
    }),
  });

  // Buscar categorias únicas (simulado - em produção viria da API)
  const categories = ['apparel', 'home-goods', 'accessories', 'food-drink'];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-background-light dark:bg-background min-h-screen">
      <div className="container mx-auto px-6 md:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12 space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold font-display leading-tight">
            Produtos
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Explore todos os produtos disponíveis de nossas ONGs parceiras
          </p>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar de Filtros */}
          <aside className="lg:col-span-1">
            <ProductFilters categories={categories} />
          </aside>

          {/* Main Content - Products */}
          <main className="lg:col-span-3">
            <div className="space-y-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                    <Skeleton className="h-6 w-1/2 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 px-8 bg-card rounded-lg border border-border shadow-sm">
                <p className="text-destructive text-xl font-semibold font-display">
                  Erro ao carregar produtos
                </p>
                <p className="text-muted-foreground text-base mt-3">
                  Tente novamente mais tarde ou entre em contato com o suporte.
                </p>
              </div>
            ) : hasValidProducts(data) ? (
              <>
                {/* Results Count */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <p className="text-base text-muted-foreground">
                    {data.meta.total} {data.meta.total === 1 ? 'produto encontrado' : 'produtos encontrados'}
                  </p>
                  <p className="text-base text-muted-foreground">
                    Página {data.meta.page} de {data.meta.totalPages}
                  </p>
                </div>

                {/* Products Grid */}
                <ProductGrid products={data.items} />

                {/* Pagination */}
                <div className="pt-8">
                  <Pagination
                    currentPage={data.meta.page}
                    totalPages={data.meta.totalPages}
                    totalItems={data.meta.total}
                    pageSize={data.meta.pageSize}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-8 bg-card rounded-lg border border-border shadow-sm">
                <div className="max-w-md mx-auto space-y-4">
                  <p className="text-2xl font-bold font-display">
                    Nenhum produto encontrado
                  </p>
                  <p className="text-base text-muted-foreground">
                    Tente ajustar os filtros ou volte mais tarde para ver novos produtos.
                  </p>
                </div>
              </div>
            )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
