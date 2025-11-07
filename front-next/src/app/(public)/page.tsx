'use client';

import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { ProductGrid } from '@/components/products/product-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page],
    queryFn: () => productsApi.getPublicProducts({ page, pageSize: 12 }),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Marketplace Multi-ONG</h1>
        <p className="text-muted-foreground text-lg">
          Descubra produtos incríveis de ONGs parceiras
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive text-lg">
            Erro ao carregar produtos. Tente novamente mais tarde.
          </p>
        </div>
      ) : data ? (
        <>
          <ProductGrid products={data.items} />

          {data.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <div className="flex items-center px-4">
                Página {page} de {data.meta.totalPages}
              </div>
              <Button
                variant="outline"
                disabled={page === data.meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
