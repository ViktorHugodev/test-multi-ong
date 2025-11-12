'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { productsApi } from '@/lib/api/products';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductFilters as IProductFilters } from '@/types/product.types';

const ProductsPage = () => {
  const [filters, setFilters] = useState<IProductFilters>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getPublicProducts(filters),
  });

  const handleFiltersChange = (newFilters: IProductFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
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

        {/* Main Content with Filters and Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3 space-y-8">
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
            ) : data && data.items.length > 0 ? (
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
