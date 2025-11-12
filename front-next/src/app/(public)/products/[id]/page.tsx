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
      <div className="bg-background-light dark:bg-background min-h-screen">
        <div className="container mx-auto px-6 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4 rounded-lg" />
              <Skeleton className="h-8 w-1/2 rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-background-light dark:bg-background min-h-screen">
        <div className="container mx-auto px-6 md:px-8 py-12">
          <div className="text-center py-16 px-8 bg-card rounded-lg border border-border shadow-sm">
            <p className="text-destructive text-2xl font-semibold mb-6">
              Produto não encontrado ou erro ao carregar.
            </p>
            <Button asChild size="lg">
              <Link href="/">Voltar para o Marketplace</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stockQty === 0;

  return (
    <div className="bg-background-light dark:bg-background min-h-screen">
      <div className="container mx-auto px-6 md:px-8 py-12">
        <nav className="flex items-center gap-3 text-base text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2">
            <Home className="h-5 w-5" />
            Início
          </Link>
          <ChevronRight className="h-5 w-5" />
          <Link href="/" className="hover:text-primary transition-colors">
            Produtos
          </Link>
          <ChevronRight className="h-5 w-5" />
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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

        <div className="space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight">
              {product.name}
            </h1>
            {product.organization && (
              <p className="text-xl text-muted-foreground">
                por{' '}
                <span className="font-semibold text-foreground">
                  {product.organization.name}
                </span>
              </p>
            )}
          </div>

          {product.description && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold font-display">Descrição</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <Separator />

          <div className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-primary font-display">
                {formatCurrency(product.price)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 text-base">
              <div className="space-y-1">
                <span className="text-muted-foreground">Estoque:</span>
                <p className="font-semibold">
                  {isOutOfStock ? (
                    <Badge variant="destructive">Esgotado</Badge>
                  ) : (
                    `${product.stockQty} unidades`
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Peso:</span>
                <p className="font-semibold">{product.weightGrams}g</p>
              </div>
              {product.sku && (
                <div className="col-span-2 space-y-1">
                  <span className="text-muted-foreground">SKU:</span>
                  <p className="font-semibold">{product.sku}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-base font-semibold block">
                Quantidade
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <div className="w-20 text-center font-bold text-2xl font-display">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stockQty || isOutOfStock}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              size="lg"
              className="w-full h-14 text-lg"
            >
              <ShoppingCart className="mr-3 h-6 w-6" />
              {isOutOfStock ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
            </Button>
          </div>

          {product.organization && (
            <Card className="mt-8">
              <CardHeader className="py-6 px-6">
                <CardTitle className="text-xl font-bold font-display">Sobre a ONG</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-center gap-6">
                  {product.organization.logoUrl && (
                    <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted border-2 border-border">
                      <Image
                        src={product.organization.logoUrl}
                        alt={product.organization.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="font-bold text-xl font-display">
                      {product.organization.name}
                    </p>
                    <p className="text-base text-muted-foreground">
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
