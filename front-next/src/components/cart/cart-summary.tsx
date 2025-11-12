'use client';

import { formatCurrency } from '@/lib/utils/format-currency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface CartSummaryProps {
  subtotal: number;
  shippingCost?: number;
  onCheckout?: () => void;
  checkoutLabel?: string;
  showContinueShopping?: boolean;
}

export function CartSummary({
  subtotal,
  shippingCost,
  onCheckout,
  checkoutLabel = 'Finalizar Compra',
  showContinueShopping = true,
}: CartSummaryProps) {
  const total = subtotal + (shippingCost || 0);

  return (
    <>
      <Card className="sticky top-24">
        <CardHeader className="py-6 px-6">
          <CardTitle className="text-2xl font-bold font-display">Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-6">
          <div className="flex justify-between text-base">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          {shippingCost !== undefined ? (
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">Frete</span>
              <span className="font-semibold">
                {shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between text-base text-muted-foreground">
              <span>Frete</span>
              <span>Calculado no checkout</span>
            </div>
          )}
          <div className="border-t border-border pt-6">
            <div className="flex justify-between text-2xl font-bold font-display">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6">
          {onCheckout ? (
            <Button className="w-full h-12 text-base" size="lg" onClick={onCheckout}>
              {checkoutLabel}
            </Button>
          ) : (
            <Button className="w-full h-12 text-base" size="lg" asChild>
              <Link href="/checkout">{checkoutLabel}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      {showContinueShopping && (
        <div className="mt-6 text-center">
          <Button variant="link" asChild className="text-base">
            <Link href="/">Continuar Comprando</Link>
          </Button>
        </div>
      )}
    </>
  );
}
