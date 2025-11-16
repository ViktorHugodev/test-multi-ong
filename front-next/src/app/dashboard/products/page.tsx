'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Package, Search } from 'lucide-react';

import { productsApi } from '@/lib/api/products';
import { ProductGrid } from '@/components/products/product-grid';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { EmptyState } from '../components/empty-state';
import { PaginatedResponse, Product } from '@/types/product.types';

const hasValidProducts = (data: unknown): data is PaginatedResponse<Product> => {
  return Boolean(
    data &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<Product>).items) &&
    'meta' in data &&
    typeof (data as PaginatedResponse<Product>).meta === 'object'
  );
};

const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-products', page],
    queryFn: () => productsApi.getPublicProducts({ page, pageSize }),
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter products by search term (client-side for now)
  const filteredProducts = data?.items?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Visão Geral', href: '/dashboard' },
          { label: 'Meus Produtos', href: '/dashboard/products' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Produtos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os produtos da sua organização
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link href="/dashboard/products/new">
            <Plus className="h-5 w-5" />
            Adicionar Produto
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar produtos por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-6 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-16">
            <EmptyState
              icon={Package}
              title="Erro ao carregar produtos"
              description="Não foi possível carregar a lista de produtos. Verifique sua conexão e tente novamente."
              action={
                <Button onClick={() => window.location.reload()}>
                  Tentar Novamente
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : hasValidProducts(data) && filteredProducts.length > 0 ? (
        <>
          {/* Results Count */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <p className="text-gray-600">
              {searchTerm
                ? `${filteredProducts.length} ${filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`
                : `${data.meta.total} ${data.meta.total === 1 ? 'produto cadastrado' : 'produtos cadastrados'}`}
            </p>
            {!searchTerm && data.meta.totalPages > 1 && (
              <p className="text-gray-600">
                Página {data.meta.page} de {data.meta.totalPages}
              </p>
            )}
          </div>

          {/* Products Grid */}
          <ProductGrid products={filteredProducts} />

          {/* Pagination */}
          {!searchTerm && data.meta.totalPages > 1 && (
            <div className="pt-8">
              <Pagination
                currentPage={data.meta.page}
                totalPages={data.meta.totalPages}
                totalItems={data.meta.total}
                pageSize={data.meta.pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-16">
            <EmptyState
              icon={Package}
              title={searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
              description={
                searchTerm
                  ? 'Tente buscar com outros termos ou limpe a busca para ver todos os produtos.'
                  : 'Comece cadastrando seu primeiro produto para aparecer no marketplace e atrair clientes para sua ONG.'
              }
              action={
                searchTerm ? (
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Limpar Busca
                  </Button>
                ) : (
                  <Button size="lg" asChild>
                    <Link href="/dashboard/products/new" className="gap-2">
                      <Plus className="h-5 w-5" />
                      Cadastrar Primeiro Produto
                    </Link>
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductsPage;
