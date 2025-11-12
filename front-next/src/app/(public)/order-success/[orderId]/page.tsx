'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import { CheckCircle2, Loader2, Package } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const orderId = params.orderId as string;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: !!orderId && isAuthenticated,
  });

  if (authLoading || isLoading) {
    return (
      <div className="bg-background-light dark:bg-background min-h-screen">
        <div className="container mx-auto px-6 md:px-8 py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-background-light dark:bg-background min-h-screen">
        <div className="container mx-auto px-6 md:px-8 py-16">
          <div className="text-center py-16 px-8 bg-card rounded-lg border border-border shadow-sm max-w-2xl mx-auto">
            <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-4xl font-bold font-display mb-4">Pedido não encontrado</h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Não foi possível encontrar os detalhes deste pedido
            </p>
            <Button asChild size="lg" className="h-12 text-base">
              <Link href="/my-orders">Ver Meus Pedidos</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      payment_processing: { label: 'Processando Pagamento', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      confirmed: { label: 'Confirmado', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      failed: { label: 'Falhou', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span className={`px-4 py-2 rounded-lg text-base font-semibold ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-background-light dark:bg-background min-h-screen">
      <div className="container mx-auto px-6 md:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <CheckCircle2 className="h-24 w-24 mx-auto text-green-600 mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Pedido Realizado com Sucesso!
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Obrigado pela sua compra. Você receberá um email com os detalhes do pedido.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
        {/* Order Info */}
        <Card>
          <CardHeader className="py-6 px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold font-display">
                  Pedido #{order.orderNumber}
                </CardTitle>
                <p className="text-base text-muted-foreground">
                  Realizado em {formatDate(order.createdAt)}
                </p>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-8">
            {/* Items */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display">Itens do Pedido</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4 p-4 bg-background-light dark:bg-background-dark rounded-lg">
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-base">{item.productName}</p>
                      <p className="text-base text-muted-foreground">
                        Quantidade: {item.quantity} × {formatCurrency(item.productPrice)}
                      </p>
                    </div>
                    <p className="font-bold text-lg text-primary">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Shipping Details */}
            {order.shippingDetails && (
              <>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-display">Endereço de Entrega</h3>
                  <div className="text-base space-y-2 bg-background-light dark:bg-background-dark p-4 rounded-lg">
                    <p className="font-bold text-foreground">
                      {order.shippingDetails.recipientName}
                    </p>
                    <p className="text-muted-foreground">{order.shippingDetails.address}</p>
                    <p className="text-muted-foreground">
                      {order.shippingDetails.city} - {order.shippingDetails.state}
                    </p>
                    <p className="text-muted-foreground">CEP: {order.shippingDetails.zipCode}</p>
                    <p className="text-muted-foreground">Tel: {order.shippingDetails.phone}</p>
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Payment Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display">Informações de Pagamento</h3>
              <div className="space-y-4 text-base">
                <div className="flex justify-between p-4 bg-background-light dark:bg-background-dark rounded-lg">
                  <span className="text-muted-foreground">Método de Pagamento</span>
                  <span className="font-semibold capitalize">
                    {order.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                {order.shippingCost !== undefined && order.shippingCost !== null && (
                  <div className="flex justify-between p-4 bg-background-light dark:bg-background-dark rounded-lg">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="font-semibold">
                      {Number(order.shippingCost) === 0
                        ? 'Grátis'
                        : formatCurrency(order.shippingCost)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-bold font-display pt-4 border-t-2 border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" size="lg" className="h-12 text-base">
            <Link href="/my-orders">Ver Meus Pedidos</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 text-base">
            <Link href="/">Continuar Comprando</Link>
          </Button>
        </div>

        {/* Additional Info */}
        {order.status === 'payment_processing' && (
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <CardContent className="py-6 px-6">
              <p className="text-base text-blue-900 dark:text-blue-200 leading-relaxed">
                <strong className="font-bold">Pagamento em processamento:</strong> Estamos processando seu pagamento.
                Você receberá uma confirmação por email assim que for aprovado.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
