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
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          {shippingCost !== undefined ? (
            <div className="flex justify-between">
              <span>Frete</span>
              <span className="font-semibold">
                {shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Frete</span>
              <span>Calculado no checkout</span>
            </div>
          )}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {onCheckout ? (
            <Button className="w-full" size="lg" onClick={onCheckout}>
              {checkoutLabel}
            </Button>
          ) : (
            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">{checkoutLabel}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      {showContinueShopping && (
        <div className="mt-4 text-center">
          <Button variant="link" asChild>
            <Link href="/">Continuar Comprando</Link>
          </Button>
        </div>
      )}
    </>
  );
}
