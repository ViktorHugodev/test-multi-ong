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
      <div className="bg-background-light dark:bg-background min-h-screen">
        <div className="container mx-auto px-6 md:px-8 py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background-light dark:bg-background min-h-screen">
        <div className="container mx-auto px-6 md:px-8 py-16">
          <div className="text-center py-16 px-8 bg-card rounded-lg border border-border shadow-sm max-w-2xl mx-auto">
            <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-4xl font-bold font-display mb-4">Erro ao carregar pedidos</h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Ocorreu um erro ao carregar seus pedidos. Tente novamente mais tarde.
            </p>
            <Button onClick={() => window.location.reload()} size="lg" className="h-12 text-base">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const orders = data?.items || [];

  if (orders.length === 0) {
    return (
      <div className="bg-background-light dark:bg-background min-h-screen">
        <div className="container mx-auto px-6 md:px-8 py-16">
          <div className="text-center py-16 px-8 bg-card rounded-lg border border-border shadow-sm max-w-2xl mx-auto">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-4xl font-bold font-display mb-4">Nenhum pedido encontrado</h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Você ainda não realizou nenhum pedido
            </p>
            <Button asChild size="lg" className="h-12 text-base">
              <Link href="/">Começar a Comprar</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background min-h-screen">
      <div className="container mx-auto px-6 md:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-4xl md:text-5xl font-bold font-display">Meus Pedidos</h1>
          <Button variant="outline" asChild className="h-11">
            <Link href="/">Continuar Comprando</Link>
          </Button>
        </div>

        <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-all">
            <CardHeader className="py-6 px-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold font-display">
                    Pedido #{order.orderNumber}
                  </CardTitle>
                  <p className="text-base text-muted-foreground">
                    Realizado em {formatDate(order.createdAt)}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Items Preview */}
                <div className="space-y-3">
                  <p className="text-base font-semibold">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </p>
                  <div className="text-base space-y-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">
                          {item.productName} <span className="font-medium text-foreground">(×{item.quantity})</span>
                        </span>
                        <span className="font-semibold text-foreground whitespace-nowrap">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm italic text-muted-foreground">
                        +{order.items.length - 3} {order.items.length - 3 === 1 ? 'item' : 'itens'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Total and Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pt-6 border-t border-border gap-4">
                  <div className="space-y-1">
                    <p className="text-base text-muted-foreground">Total</p>
                    <p className="text-3xl font-bold text-primary font-display">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Button asChild variant="outline" className="h-11">
                      <Link href={`/order-success/${order.id}`}>Ver Detalhes</Link>
                    </Button>
                    {order.status === 'confirmed' && (
                      <Button asChild className="h-11">
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
        <div className="mt-8 text-center text-base text-muted-foreground">
          Mostrando {orders.length} de {data.meta.total} pedidos
        </div>
      )}
    </div>
  );
}
