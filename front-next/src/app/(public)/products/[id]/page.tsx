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
    <div className="bg-background-light min-h-screen">
      <div className="container mx-auto px-6 md:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">Home Goods</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-gray-200 rounded-xl overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-32 w-32 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square relative bg-gray-200 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer transition-colors">
                  {product.imageUrl && i === 1 ? (
                    <Image
                      src={product.imageUrl}
                      alt={`${product.name} ${i}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4].map((star) => (
                  <span key={star} className="material-symbols-outlined text-yellow-400 text-xl">
                    star
                  </span>
                ))}
                <span className="material-symbols-outlined text-yellow-400 text-xl">
                  star_half
                </span>
                <span className="text-sm text-gray-600 ml-2">(120 reviews)</span>
              </div>
              {product.description && (
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            <div className="text-4xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="w-16 h-10 text-center border border-gray-300 rounded-lg font-medium"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stockQty || isOutOfStock}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {/* NGO Info */}
            {product.organization && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-600">
                      volunteer_activism
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sold by</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {product.organization.name}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  We empower global artisans by providing a platform to share their craft and earn a sustainable income, preserving cultural heritage for future generations.
                </p>
                <Link
                  href={`/ngos/${product.organization.slug}`}
                  className="text-primary font-medium text-sm hover:underline"
                >
                  Visit NGO Storefront
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* You might also like */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for related products */}
            <div className="text-center text-gray-500 col-span-full py-8">
              Related products will appear here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
