'use client';

import { useState } from 'react';
import { useProducts } from '@/lib/hooks/use-products';
import { DashboardLoadingState } from './components/loading-state';
import { ErrorState } from './components/error-state';
import { ProductList } from './components/product-list';
import { AddProductDialog } from './components/add-product-dialog';

export default function DashboardPage() {
  const [filters] = useState({ page: 1, pageSize: 50 });

  // Buscar dados da API
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts(filters);

  // Estados de Loading
  if (isLoadingProducts) {
    return <DashboardLoadingState />;
  }

  // Estados de Erro
  if (productsError) {
    return (
      <div className="p-8">
        <ErrorState
          title="Erro ao carregar produtos"
          message="Não foi possível carregar a lista de produtos. Verifique sua conexão e tente novamente."
          onRetry={() => refetchProducts()}
        />
      </div>
    );
  }

  // Dados carregados
  const products = productsData?.items || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Home</span>
            <span>/</span>
            <span>Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus produtos e visualize métricas importantes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddProductDialog />
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Meus Produtos</h2>
            <p className="text-sm text-gray-600 mt-1">
              {products.length} {products.length === 1 ? 'produto' : 'produtos'} cadastrados
            </p>
          </div>
        </div>

        <ProductList
          products={products}
          onEdit={(product) => {
            // TODO: Implementar edição de produto
            console.log('Editar produto:', product);
          }}
          onDelete={(product) => {
            // TODO: Implementar exclusão de produto
            console.log('Excluir produto:', product);
          }}
        />
      </div>
    </div>
  );
}
