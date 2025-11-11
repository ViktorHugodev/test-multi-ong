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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
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
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-2">
          {product.category}
        </Badge>
        <h3 className="font-semibold text-lg line-clamp-2 mt-2">{product.name}</h3>
        <p className="text-2xl font-bold mt-2">{formatCurrency(product.price)}</p>
        {product.organization && (
          <p className="text-sm text-muted-foreground mt-1">
            por {product.organization.name}
          </p>
        )}
        <Button asChild className="w-full mt-4">
          <Link href={`/products/${product.id}`}>Ver Detalhes</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
