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
    <div className="flex gap-4 py-4 border-b">
      <div className="w-24 h-24 bg-muted rounded flex-shrink-0 relative">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded"
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Sem imagem
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold">{product.name}</h3>
        {product.organization && (
          <p className="text-sm text-muted-foreground">
            Por {product.organization.name}
          </p>
        )}
        <p className="text-sm font-semibold mt-1">
          {formatCurrency(product.price)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => onUpdateQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center"
            min="1"
            max={product.stockQty}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(Math.min(product.stockQty, quantity + 1))}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="font-semibold">{formatCurrency(subtotal)}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remover
        </Button>
      </div>
    </div>
  );
}
