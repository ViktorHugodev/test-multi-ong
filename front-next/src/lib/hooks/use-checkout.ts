'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCart } from './use-cart';

export interface StockError {
  productId: string;
  productName: string;
  requested: number;
  available: number;
}

interface CheckoutData {
  paymentMethod: string;
  shippingDetails?: Record<string, unknown>;
}

export function useCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stockErrors, setStockErrors] = useState<StockError[]>([]);
  const router = useRouter();
  const { items, clearCart, removeItem, updateQuantity } = useCart();

  const processCheckout = async (checkoutData: CheckoutData) => {
    setIsProcessing(true);
    setStockErrors([]);

    try {
      // Gerar idempotency key para prevenir pedidos duplicados
      const idempotencyKey = `${Date.now()}-${Math.random()}`;

      const orderData = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        idempotencyKey,
        shippingDetails: checkoutData.shippingDetails,
        paymentMethod: checkoutData.paymentMethod,
      };

      // Fazer a chamada para criar o pedido
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Tratar erro de estoque insuficiente
        if (errorData.error === 'INSUFFICIENT_STOCK') {
          const errors = errorData.details as StockError[];
          setStockErrors(errors);

          toast.error('Alguns produtos não têm estoque disponível', {
            description: 'Revise seu carrinho e tente novamente',
          });
          return;
        }

        throw new Error(errorData.message || 'Erro ao processar pedido');
      }

      const order = await response.json();

      // Sucesso: limpar carrinho e redirecionar
      clearCart();
      toast.success('Pedido realizado com sucesso!');
      router.push(`/order-success/${order.id}`);
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      toast.error('Erro ao processar pedido', {
        description: 'Tente novamente em alguns instantes',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeUnavailableItems = () => {
    stockErrors.forEach((error) => {
      removeItem(error.productId);
    });
    setStockErrors([]);
    toast.success('Itens sem estoque removidos do carrinho');
  };

  const adjustQuantities = () => {
    stockErrors.forEach((error) => {
      if (error.available > 0) {
        updateQuantity(error.productId, error.available);
      } else {
        removeItem(error.productId);
      }
    });
    setStockErrors([]);
    toast.success('Quantidades ajustadas');
  };

  return {
    isProcessing,
    stockErrors,
    processCheckout,
    removeUnavailableItems,
    adjustQuantities,
  };
}
