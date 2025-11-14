'use client';

import { Product } from '@/types/product.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/format-currency';
import { Trash2, Minus, Plus } from 'lucide-react';
import Image from 'next/image';

interface CartItemProps {
  product: Product;
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({ product, quantity, onUpdateQuantity, onRemove }: CartItemProps) {
  const subtotal = Number(product.price) * quantity;

  return (
    <div className="flex gap-6 py-6 border-b border-border last:border-0">
      <div className="w-28 h-28 bg-muted rounded-lg flex-shrink-0 relative overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="112px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Sem imagem
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="font-bold text-lg font-display">{product.name}</h3>
        {product.organization && (
          <p className="text-base text-muted-foreground">
            Por {product.organization.name}
          </p>
        )}
        <p className="text-base font-semibold text-primary">
          {formatCurrency(product.price)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-4 min-w-fit">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => onUpdateQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center h-9"
            min="1"
            max={product.stockQty}
          />
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onUpdateQuantity(Math.min(product.stockQty, quantity + 1))}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="font-bold text-xl font-display text-primary">{formatCurrency(subtotal)}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remover
        </Button>
      </div>
    </div>
  );
}
