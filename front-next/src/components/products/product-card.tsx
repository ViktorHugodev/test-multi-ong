import Link from 'next/link';
import Image from 'next/image';
import { Package } from 'lucide-react';

import { Product } from '@/types/product.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format-currency';

interface IProductCardProps {
  product: Product;
}

export function ProductCard({ product }: IProductCardProps) {
  return (
    <Card className="group overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-lg">
      <div className="aspect-square relative bg-muted overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-20 w-20 text-muted-foreground" />
          </div>
        )}
        {product.stockQty === 0 && (
          <Badge className="absolute top-3 right-3 rounded-lg shadow-md" variant="destructive">
            Esgotado
          </Badge>
        )}
        {product.organization && (
          <div className="absolute bottom-3 left-3">
            <Badge
              variant="secondary"
              className="bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm border border-border shadow-md rounded-lg"
            >
              {product.organization.name}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Badge variant="secondary" className="rounded-lg">
            {product.category}
          </Badge>
          <h3 className="font-semibold text-lg line-clamp-2 font-display leading-tight">
            {product.name}
          </h3>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-primary font-display">
            {formatCurrency(product.price)}
          </p>
          {product.stockQty > 0 && (
            <p className="text-sm text-muted-foreground">
              {product.stockQty} em estoque
            </p>
          )}
        </div>
        <Button asChild className="w-full">
          <Link href={`/products/${product.id}`}>Ver Detalhes</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
