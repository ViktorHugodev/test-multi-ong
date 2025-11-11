'use client';

import { Product } from '@/types/product.types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format-currency';
import { useCart } from '@/lib/hooks/use-cart';
import { toast } from 'sonner';
import { ShoppingCart, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success('Produto adicionado ao carrinho!', {
      description: product.name,
    });
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden group hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          {product.stockQty === 0 && (
            <Badge className="absolute top-2 right-2" variant="destructive">
              Esgotado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <Link href={`/products/${product.id}`} className="hover:underline">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">{product.name}</h3>
        </Link>
        {product.organization && (
          <p className="text-sm text-muted-foreground mb-2">
            Por {product.organization.name}
          </p>
        )}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          <Badge variant="secondary">{product.category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={product.stockQty === 0}
          className="w-full"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stockQty === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
        </Button>
      </CardFooter>
    </Card>
  );
}
