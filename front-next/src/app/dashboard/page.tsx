'use client';

import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useDashboardStats, useRecentOrders } from '@/lib/hooks/use-dashboard-stats';
import { useProducts } from '@/lib/hooks/use-products';
import { DashboardLoadingState } from './components/loading-state';
import { ErrorState } from './components/error-state';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  const {
    data: recentOrdersData,
    isLoading: isLoadingOrders,
  } = useRecentOrders(5);

  const {
    data: productsData,
    isLoading: isLoadingProducts,
  } = useProducts({ page: 1, pageSize: 10 });

  // Estado de Loading
  if (isLoadingStats) {
    return <DashboardLoadingState />;
  }

  // Estado de Erro
  if (statsError) {
    return (
      <div className="p-8">
        <ErrorState
          title="Erro ao carregar dashboard"
          message="Não foi possível carregar as informações do dashboard. Verifique sua conexão e tente novamente."
          onRetry={() => refetchStats()}
        />
      </div>
    );
  }

  const stats = statsData;
  const recentOrders = recentOrdersData || [];
  const products = productsData?.items || [];

  // Calcular produtos com estoque baixo
  const lowStockProducts = products.filter((p) => p.stockQty < 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendente', variant: 'secondary' },
      processing: { label: 'Processando', variant: 'default' },
      shipped: { label: 'Enviado', variant: 'default' },
      delivered: { label: 'Entregue', variant: 'outline' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="p-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: 'Visão Geral', href: '/dashboard' }]}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-600 mt-1">
          Acompanhe o desempenho da sua organização
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Vendas do Mês"
          value={stats ? formatCurrency(stats.totalRevenue) : 'R$ 0,00'}
          change={stats ? `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}%` : undefined}
          trend={stats && stats.revenueChange >= 0 ? 'up' : 'down'}
          icon={DollarSign}
        />
        <MetricCard
          title="Pedidos"
          value={stats?.totalOrders || 0}
          change={stats ? `${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange.toFixed(1)}%` : undefined}
          trend={stats && stats.ordersChange >= 0 ? 'up' : 'down'}
          icon={ShoppingBag}
        />
        <MetricCard
          title="Produtos Ativos"
          value={products.length}
          icon={Package}
          description="Total de produtos cadastrados"
        />
        <MetricCard
          title="Estoque Baixo"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          alert={lowStockProducts.length > 0}
          description={lowStockProducts.length > 0 ? 'Produtos precisam de reposição' : 'Estoque em dia'}
        />
      </div>

      {/* Grid de Gráficos/Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/orders" className="gap-2">
                Ver Todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Nenhum pedido recente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{order.customer}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.date)} • {order.items} {order.items === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-sm">{formatCurrency(order.total)}</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Produtos Mais Vendidos / Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3 h-12" asChild>
              <Link href="/dashboard/products">
                <Package className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Gerenciar Produtos</p>
                  <p className="text-xs text-gray-500">Adicionar, editar ou remover produtos</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12" asChild>
              <Link href="/dashboard/orders">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Ver Pedidos</p>
                  <p className="text-xs text-gray-500">Acompanhar status e histórico</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12" asChild>
              <Link href="/dashboard/organization">
                <Users className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Minha Organização</p>
                  <p className="text-xs text-gray-500">Configurações e informações da ONG</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12" asChild>
              <Link href="/">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Ver Marketplace</p>
                  <p className="text-xs text-gray-500">Visualizar como cliente</p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Produtos com Estoque Baixo */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg text-orange-800">
                Alerta de Estoque Baixo
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/products">Gerenciar Estoque</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white border border-orange-100"
                >
                  <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-orange-600 font-medium">
                      Apenas {product.stockQty} em estoque
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
