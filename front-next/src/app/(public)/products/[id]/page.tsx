'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Home, Minus, Package, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { productsApi } from '@/lib/api/products';
import { useCart } from '@/lib/hooks/use-cart';
import { formatCurrency } from '@/lib/utils/format-currency';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getPublicProductById(productId),
  });

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success('Produto adicionado ao carrinho!', {
        description: `${quantity}x ${product.name}`,
      });
      router.push('/cart');
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (product && newQuantity >= 1 && newQuantity <= product.stockQty) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-destructive text-lg mb-4">
            Produto não encontrado ou erro ao carregar.
          </p>
          <Button asChild>
            <Link href="/">Voltar para o Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stockQty === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground flex items-center gap-1">
          <Home className="h-4 w-4" />
          Início
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/" className="hover:text-foreground">
          Produtos
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-32 w-32 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3">
              {product.category}
            </Badge>
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            {product.organization && (
              <p className="text-lg text-muted-foreground">
                por{' '}
                <span className="font-semibold text-foreground">
                  {product.organization.name}
                </span>
              </p>
            )}
          </div>

          {product.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Descrição</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Estoque:</span>
                <p className="font-semibold">
                  {isOutOfStock ? (
                    <Badge variant="destructive">Esgotado</Badge>
                  ) : (
                    `${product.stockQty} unidades`
                  )}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Peso:</span>
                <p className="font-semibold">{product.weightGrams}g</p>
              </div>
              {product.sku && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">SKU:</span>
                  <p className="font-semibold">{product.sku}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Quantidade
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-16 text-center font-semibold text-lg">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stockQty || isOutOfStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              size="lg"
              className="w-full"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isOutOfStock ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
            </Button>
          </div>

          {product.organization && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sobre a ONG</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {product.organization.logoUrl && (
                    <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={product.organization.logoUrl}
                        alt={product.organization.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">
                      {product.organization.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{product.organization.slug}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
