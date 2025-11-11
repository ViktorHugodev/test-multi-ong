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
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          Não foi possível encontrar os detalhes deste pedido
        </p>
        <Button asChild>
          <Link href="/my-orders">Ver Meus Pedidos</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      payment_processing: { label: 'Processando Pagamento', className: 'bg-blue-100 text-blue-800' },
      confirmed: { label: 'Confirmado', className: 'bg-green-100 text-green-800' },
      failed: { label: 'Falhou', className: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 mx-auto text-green-600 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Pedido Realizado com Sucesso!</h1>
        <p className="text-muted-foreground">
          Obrigado pela sua compra. Você receberá um email com os detalhes do pedido.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pedido #{order.orderNumber}</CardTitle>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              Realizado em {formatDate(order.createdAt)}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Items */}
            <div>
              <h3 className="font-semibold mb-3">Itens do Pedido</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {item.quantity} × {formatCurrency(item.productPrice)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Shipping Details */}
            {order.shippingDetails && (
              <>
                <div>
                  <h3 className="font-semibold mb-3">Endereço de Entrega</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">
                      {order.shippingDetails.recipientName}
                    </p>
                    <p>{order.shippingDetails.address}</p>
                    <p>
                      {order.shippingDetails.city} - {order.shippingDetails.state}
                    </p>
                    <p>CEP: {order.shippingDetails.zipCode}</p>
                    <p>Tel: {order.shippingDetails.phone}</p>
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Payment Info */}
            <div>
              <h3 className="font-semibold mb-3">Informações de Pagamento</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método de Pagamento</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                {order.shippingCost !== undefined && order.shippingCost !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="font-medium">
                      {Number(order.shippingCost) === 0
                        ? 'Grátis'
                        : formatCurrency(order.shippingCost)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" size="lg">
            <Link href="/my-orders">Ver Meus Pedidos</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Continuar Comprando</Link>
          </Button>
        </div>

        {/* Additional Info */}
        {order.status === 'payment_processing' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>Pagamento em processamento:</strong> Estamos processando seu pagamento.
                Você receberá uma confirmação por email assim que for aprovado.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
