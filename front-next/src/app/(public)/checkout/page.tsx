'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useCart } from '@/lib/hooks/use-cart';
import { useAuth } from '@/lib/hooks/use-auth';
import { createOrdersApi } from '@/lib/api/orders';
import { useSession } from 'next-auth/react';
import { checkoutSchema, CheckoutFormData } from '@/lib/validations/checkout.schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils/format-currency';
import { ShoppingBag, Loader2, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [mounted, setMounted] = useState(false);

  // Criar API autenticada com token da sessão
  const ordersApi = useMemo(() => createOrdersApi(accessToken), [accessToken]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'pix',
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      toast.error('Você precisa estar logado para finalizar a compra');
      router.push('/login?redirect=/checkout');
    }
  }, [mounted, isAuthenticated, authLoading, router]);

  // Redirect to cart if empty
  useEffect(() => {
    if (mounted && items.length === 0) {
      toast.error('Seu carrinho está vazio');
      router.push('/cart');
    }
  }, [mounted, items.length, router]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const orderData = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        shippingDetails: {
          recipientName: data.recipientName,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          phone: data.phone,
        },
        paymentMethod: data.paymentMethod,
        idempotencyKey: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      return ordersApi.createOrder(orderData);
    },
    onSuccess: (order) => {
      clearCart();
      toast.success('Pedido criado com sucesso!', {
        description: `Número do pedido: ${order.orderNumber}`,
      });
      router.push(`/order-success/${order.id}`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const errorMessage = error.response?.data?.message || 'Erro ao criar pedido';
      toast.error('Erro ao finalizar compra', {
        description: errorMessage,
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    createOrderMutation.mutate(data);
  };

  const total = getTotal();

  if (!mounted || authLoading) {
    return (
      <div className="bg-background-light dark:bg-background min-h-screen">
        <div className="container mx-auto px-6 md:px-8 py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background min-h-screen">
      <div className="container mx-auto px-6 md:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-8">Finalizar Compra</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulário de entrega */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dados de entrega */}
              <Card>
                <CardHeader className="py-6 px-6">
                  <CardTitle className="text-2xl font-bold font-display">Dados de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 px-6 pb-6">
                <div>
                  <Label htmlFor="recipientName">Nome Completo do Destinatário</Label>
                  <Input
                    id="recipientName"
                    {...register('recipientName')}
                    placeholder="João da Silva"
                  />
                  {errors.recipientName && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.recipientName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="(11) 98765-4321"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    {...register('zipCode')}
                    placeholder="12345-678"
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-destructive mt-1">{errors.zipCode.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="Rua Exemplo, 123, Apto 45"
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="São Paulo"
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state">Estado (UF)</Label>
                    <Input
                      id="state"
                      {...register('state')}
                      placeholder="SP"
                      maxLength={2}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Método de pagamento */}
            <Card>
              <CardHeader className="py-6 px-6">
                <CardTitle className="text-2xl font-bold font-display">Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <RadioGroup
                  defaultValue="pix"
                  onValueChange={(value) => setValue('paymentMethod', value as any)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-4 p-4 border-2 border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        <div>
                          <p className="font-semibold">PIX</p>
                          <p className="text-sm text-muted-foreground">
                            Pagamento instantâneo
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border-2 border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6" />
                        <div>
                          <p className="font-semibold text-base">Cartão de Crédito</p>
                          <p className="text-sm text-muted-foreground">
                            Parcelamento disponível
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border-2 border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="debit_card" id="debit_card" />
                    <Label htmlFor="debit_card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6" />
                        <div>
                          <p className="font-semibold text-base">Cartão de Débito</p>
                          <p className="text-sm text-muted-foreground">À vista</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                {errors.paymentMethod && (
                  <p className="text-sm text-destructive mt-2">
                    {errors.paymentMethod.message}
                  </p>
                )}
              </CardContent>
            </Card>
            </div>

            {/* Resumo do pedido */}
            <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="py-6 px-6">
                <CardTitle className="text-2xl font-bold font-display">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                {/* Items */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 text-base">
                      <div className="flex-1">
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-bold">
                        {formatCurrency(Number(item.product.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="font-semibold text-green-600">Grátis</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-2xl font-bold font-display">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  size="lg"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="mr-3 h-5 w-5" />
                      Finalizar Pedido
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button variant="link" asChild className="text-base">
                    <Link href="/cart">Voltar ao Carrinho</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}
