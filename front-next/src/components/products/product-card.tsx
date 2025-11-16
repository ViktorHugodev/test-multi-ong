import Link from 'next/link';
import Image from 'next/image';
import { Package, ShoppingCart } from 'lucide-react';

import { Product } from '@/types/product.types';
import { formatCurrency } from '@/lib/utils/format-currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface IProductCardProps {
  product: Product;
}

export function ProductCard({ product }: IProductCardProps) {
  const isLowStock = product.stockQty > 0 && product.stockQty < 5;
  const isOutOfStock = product.stockQty === 0;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
        {/* Product Image */}
        <div className="aspect-square relative bg-gray-100 overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* NGO Badge - Top Left */}
          {product.organization && (
            <div className="absolute top-3 left-3">
              <Badge
                variant="secondary"
                className="bg-white/95 backdrop-blur-sm text-gray-700 border border-gray-200 shadow-sm"
              >
                <span className="material-symbols-outlined text-xs mr-1">
                  volunteer_activism
                </span>
                {product.organization.name}
              </Badge>
            </div>
          )}

          {/* Stock Status Badge - Top Right */}
          {isOutOfStock && (
            <Badge
              variant="destructive"
              className="absolute top-3 right-3"
            >
              Esgotado
            </Badge>
          )}
          {isLowStock && !isOutOfStock && (
            <Badge
              variant="secondary"
              className="absolute top-3 right-3 bg-orange-100 text-orange-700 border-orange-200"
            >
              Últimas unidades
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <CardContent className="p-4 space-y-3">
          {/* Category */}
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {product.category}
          </p>

          {/* Product Name */}
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price and Action */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(product.price)}
            </p>
            <Button
              size="sm"
              className="gap-2"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic would go here
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              {isOutOfStock ? 'Indisponível' : 'Adicionar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
