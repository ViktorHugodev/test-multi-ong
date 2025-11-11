'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import { Loader2, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/my-orders');
    }
  }, [isAuthenticated, authLoading, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getMyOrders(1, 50),
    enabled: isAuthenticated,
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      payment_processing: {
        label: 'Processando',
        className: 'bg-blue-100 text-blue-800',
      },
      confirmed: { label: 'Confirmado', className: 'bg-green-100 text-green-800' },
      failed: { label: 'Falhou', className: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Erro ao carregar pedidos</h1>
        <p className="text-muted-foreground mb-6">
          Ocorreu um erro ao carregar seus pedidos. Tente novamente mais tarde.
        </p>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  const orders = data?.items || [];

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Nenhum pedido encontrado</h1>
          <p className="text-muted-foreground mb-6">
            Você ainda não realizou nenhum pedido
          </p>
          <Button asChild>
            <Link href="/">Começar a Comprar</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Meus Pedidos</h1>
        <Button variant="outline" asChild>
          <Link href="/">Continuar Comprando</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Pedido #{order.orderNumber}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Realizado em {formatDate(order.createdAt)}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Items Preview */}
                <div>
                  <p className="text-sm font-medium mb-2">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.productName} (×{item.quantity})
                        </span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs italic">
                        +{order.items.length - 3} {order.items.length - 3 === 1 ? 'item' : 'itens'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Total and Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/order-success/${order.id}`}>Ver Detalhes</Link>
                    </Button>
                    {order.status === 'confirmed' && (
                      <Button asChild size="sm">
                        <Link href="/">Comprar Novamente</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Mostrando {orders.length} de {data.meta.total} pedidos
        </div>
      )}
    </div>
  );
}
