'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Heart, ShoppingBag, Users } from 'lucide-react';

import { productsApi } from '@/lib/api/products';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductFilters as IProductFilters, PaginatedResponse, Product } from '@/types/product.types';

const hasValidProducts = (data: unknown): data is PaginatedResponse<Product> => {
  return Boolean(
    data &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<Product>).items) &&
    (data as PaginatedResponse<Product>).items.length > 0 &&
    'meta' in data &&
    typeof (data as PaginatedResponse<Product>).meta === 'object'
  );
};

const HomePage = () => {
  const [filters, setFilters] = useState<IProductFilters>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchQuery, page: 1 });
  };

  return (
    <div className="bg-background-light dark:bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/90 via-primary to-primary/80 py-24 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Compre com Propósito.
                <br />
                <span className="text-white/90">Apoie Grandes Causas.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                Descubra produtos únicos de ONGs de todo o Brasil. Cada compra faz a diferença.
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2 bg-white rounded-xl p-2 shadow-2xl">
                <div className="flex items-center flex-1 px-4">
                  <Search className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar produtos, categorias ou ONGs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-gray-900 placeholder:text-gray-500 text-base"
                  />
                </div>
                <Button type="submit" size="lg" className="px-8">
                  Buscar
                </Button>
              </div>
            </form>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 max-w-3xl mx-auto">
              <div className="flex flex-col items-center gap-2 text-white/90">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-sm">Produtos Disponíveis</p>
              </div>
              <div className="flex flex-col items-center gap-2 text-white/90">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-sm">ONGs Parceiras</p>
              </div>
              <div className="flex flex-col items-center gap-2 text-white/90">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                  <Heart className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-white">1000+</p>
                <p className="text-sm">Pessoas Impactadas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-8">
          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              Explore Produtos que Transformam
            </h2>
            <p className="text-gray-600">
              Cada produto conta uma história e apoia uma causa
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <ProductFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                  />
                </CardContent>
              </Card>
            </aside>

            {/* Products Grid */}
            <main className="lg:col-span-3 space-y-8">
              {/* Results Count */}
              {!isLoading && !error && hasValidProducts(data) && (
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <p className="text-gray-600 font-medium">
                    {data.meta.total}{' '}
                    {data.meta.total === 1
                      ? 'produto encontrado'
                      : 'produtos encontrados'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Página {data.meta.page} de {data.meta.totalPages}
                  </p>
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-square w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-6 w-1/2 rounded" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <p className="text-red-600 text-xl font-semibold mb-2">
                      Erro ao carregar produtos
                    </p>
                    <p className="text-gray-600">
                      Tente novamente mais tarde ou entre em contato com o suporte.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="mt-4"
                    >
                      Tentar Novamente
                    </Button>
                  </CardContent>
                </Card>
              ) : hasValidProducts(data) ? (
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
                <Card>
                  <CardContent className="py-16 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-900 mb-2">
                      Nenhum produto encontrado
                    </p>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Tente ajustar os filtros ou buscar por outros termos para encontrar o que procura.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({
                          page: 1,
                          pageSize: 20,
                          sortBy: 'createdAt',
                          sortOrder: 'desc',
                        });
                        setSearchQuery('');
                      }}
                      className="mt-4"
                    >
                      Limpar Filtros
                    </Button>
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
