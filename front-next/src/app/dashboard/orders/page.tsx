'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ordersApi } from '@/lib/api/orders';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { EmptyState } from '../components/empty-state';
import { formatCurrency } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import { ShoppingBag, Eye, RefreshCw } from 'lucide-react';
import { useAuthNextAuth } from '@/lib/hooks/use-auth-nextauth';

export default function DashboardOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthNextAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/orders');
    }
  }, [isAuthenticated, authLoading, router]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: () => ordersApi.getMyOrders(1, 50),
    enabled: isAuthenticated,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendente', variant: 'secondary' },
      payment_processing: { label: 'Processando', variant: 'default' },
      confirmed: { label: 'Confirmado', variant: 'outline' },
      failed: { label: 'Falhou', variant: 'destructive' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (authLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center py-16">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    );
  }

  const orders = data?.items || [];

  return (
    <div className="p-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Visão Geral', href: '/dashboard' },
          { label: 'Pedidos', href: '/dashboard/orders' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos Recebidos</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe e gerencie os pedidos da sua organização
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-16">
            <EmptyState
              icon={ShoppingBag}
              title="Erro ao carregar pedidos"
              description="Não foi possível carregar a lista de pedidos. Verifique sua conexão e tente novamente."
              action={
                <Button onClick={() => refetch()}>Tentar Novamente</Button>
              }
            />
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <EmptyState
              icon={ShoppingBag}
              title="Nenhum pedido recebido"
              description="Quando clientes comprarem seus produtos, os pedidos aparecerão aqui para você gerenciar."
              action={
                <Button asChild>
                  <Link href="/dashboard/products">Ver Meus Produtos</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Count */}
          <div className="py-4 border-b border-gray-200">
            <p className="text-gray-600">
              {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} encontrados
            </p>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-all">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold">
                        Pedido #{order.orderNumber}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Customer Info */}
                    {order.customer && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customer.email}
                        </p>
                      </div>
                    )}

                    {/* Items Preview */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                      </p>
                      <div className="space-y-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.productName}{' '}
                              <span className="font-medium text-gray-900">
                                (×{item.quantity})
                              </span>
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs text-gray-500 italic">
                            +{order.items.length - 3} mais{' '}
                            {order.items.length - 3 === 1 ? 'item' : 'itens'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Total and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200 gap-3">
                      <div>
                        <p className="text-sm text-gray-600">Total do Pedido</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                      <Button variant="outline" className="gap-2" asChild>
                        <Link href={`/order-success/${order.id}`}>
                          <Eye className="h-4 w-4" />
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Info */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="text-center text-sm text-gray-600 pt-4">
              Mostrando {orders.length} de {data.meta.total} pedidos
            </div>
          )}
        </>
      )}
    </div>
  );
}
