'use client';

import { useCart } from '@/lib/hooks/use-cart';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();

  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="bg-background-light dark:bg-background min-h-screen">
        <div className="container mx-auto px-6 md:px-8 py-16">
          <div className="text-center py-16 px-8 bg-card rounded-lg border border-border shadow-sm max-w-2xl mx-auto">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-4xl font-bold font-display mb-4">Seu carrinho está vazio</h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Adicione produtos para continuar comprando
            </p>
            <Button asChild size="lg" className="h-12 text-base">
              <Link href="/">Ver Produtos</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background min-h-screen">
      <div className="container mx-auto px-6 md:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-8">Carrinho de Compras</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="py-6 px-6">
                <CardTitle className="text-2xl font-bold font-display">
                  Produtos ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {items.map((item) => (
                  <CartItem
                    key={item.product.id}
                    product={item.product}
                    quantity={item.quantity}
                    onUpdateQuantity={(qty) => updateQuantity(item.product.id, qty)}
                    onRemove={() => removeItem(item.product.id)}
                  />
                ))}
              </CardContent>
              <CardFooter className="px-6 pb-6">
                <Button variant="outline" onClick={clearCart} className="h-11">
                  Limpar Carrinho
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <CartSummary subtotal={total} />
          </div>
        </div>
      </div>
    </div>
  );
}
