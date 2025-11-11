'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';

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
      <section className="relative bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 py-24 md:py-32">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Shop with Purpose. Support Great Causes.
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Discover unique products from NGOs around the world. Every purchase makes a difference.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-8">
              <div className="flex gap-3 bg-white rounded-lg p-2 shadow-lg">
                <div className="flex items-center flex-1 px-4">
                  <Search className="h-5 w-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search for products or NGOs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0891b2] hover:bg-[#0e7490] text-white font-medium rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Discover Goods that Give Back</h2>
          </div>

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
      </section>
    </div>
  );
};

export default HomePage;
