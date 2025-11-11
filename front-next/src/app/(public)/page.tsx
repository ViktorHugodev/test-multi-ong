'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { productsApi } from '@/lib/api/products';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductFilters as IProductFilters } from '@/types/product.types';

const HomePage = () => {
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
        <div className="mb-12 space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold font-display leading-tight">
            Marketplace Multi-ONG
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Descubra produtos incríveis de ONGs parceiras
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />
          </aside>

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
              <div className="text-center py-16 px-6 bg-card rounded-lg border border-border shadow-sm">
                <p className="text-destructive text-xl font-semibold">
                  Erro ao carregar produtos. Tente novamente mais tarde.
                </p>
              </div>
            ) : data && data.items.length > 0 ? (
              <>
                <ProductGrid products={data.items} />
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
              <div className="text-center py-16 px-6 bg-card rounded-lg border border-border shadow-sm">
                <p className="text-muted-foreground text-xl font-semibold">
                  Nenhum produto encontrado com os filtros selecionados
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
